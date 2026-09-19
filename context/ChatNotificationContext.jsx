'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

const ChatNotificationContext = createContext(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const getUserId = (user) => user?._id || user?.id;
const getMessageId = (message) => message?._id || `${message?.sender?._id || 'unknown'}-${message?.createdAt || message?.message}`;

export function ChatNotificationProvider({ children }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = getUserId(user);

  useEffect(() => {
    if (loading || !userId) return undefined;

    let active = true;
    const storageKey = `team-chat-read-at-${userId}`;
    const ownMessageIds = new Set();

    const isOwnMessage = (message) => {
      const senderId = message?.sender?._id || message?.sender?.id || message?.sender;
      return senderId && String(senderId) === String(userId);
    };

    const updateCountFromMessages = (messages) => {
      const lastReadAt = localStorage.getItem(storageKey);
      if (!lastReadAt) {
        const latestMessage = messages.at(-1);
        if (latestMessage?.createdAt) localStorage.setItem(storageKey, latestMessage.createdAt);
        setUnreadCount(0);
        return;
      }

      setUnreadCount(messages.filter((message) => (
        !isOwnMessage(message)
        && message.createdAt
        && new Date(message.createdAt) > new Date(lastReadAt)
      )).length);
    };

    const loadMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const messages = await response.json();
        if (active && response.ok && Array.isArray(messages)) updateCountFromMessages(messages);
      } catch (error) {
        console.error(error);
      }
    };

    const socket = io(SOCKET_URL);
    socket.on('receive-message', (message) => {
      if (!active || isOwnMessage(message)) return;

      const messageId = getMessageId(message);
      if (ownMessageIds.has(messageId)) return;
      ownMessageIds.add(messageId);

      if (pathname.includes('/chat')) {
        const readAt = message.createdAt || new Date().toISOString();
        localStorage.setItem(storageKey, readAt);
        setUnreadCount(0);
      } else {
        setUnreadCount((count) => count + 1);
      }
    });

    loadMessages();

    return () => {
      active = false;
      socket.disconnect();
    };
  }, [loading, pathname, userId]);

  useEffect(() => {
    if (!userId || !pathname.includes('/chat')) return;

    const storageKey = `team-chat-read-at-${userId}`;
    const markChatAsRead = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const messages = await response.json();
        const latestMessage = Array.isArray(messages) ? messages.at(-1) : null;
        localStorage.setItem(storageKey, latestMessage?.createdAt || new Date().toISOString());
        setUnreadCount(0);
      } catch (error) {
        console.error(error);
      }
    };

    markChatAsRead();
  }, [pathname, userId]);

  return (
    <ChatNotificationContext.Provider value={{ unreadCount }}>
      {children}
    </ChatNotificationContext.Provider>
  );
}

export function useChatNotifications() {
  return useContext(ChatNotificationContext);
}