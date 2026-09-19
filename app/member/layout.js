'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useChatNotifications } from '@/context/ChatNotificationContext';

const links = [
  { href: '/member', label: 'Dashboard' },
  { href: '/member/tasks', label: 'Tasks' },
  { href: '/member/requests', label: 'Requests' },
  { href: '/member/profiles', label: 'Profiles' },
  { href: '/member/chat', label: 'Group Chat' },
  { href: '/member/ai', label: 'AI Assistant' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

export default function MemberLayout({ children }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { unreadCount } = useChatNotifications();

  return (
    <div className="min-h-screen app-shell">
      <div className="flex min-h-screen">
        <aside className="w-full max-w-[260px] sidebar p-5 hidden md:block">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">TeamWep</p>
            <h2 className="mt-2 text-2xl font-black">Member panel</h2>
          </div>

          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link block rounded-xl px-4 py-3 text-sm font-medium transition ${pathname === link.href ? 'sidebar-link-active' : ''}`}
              >
                <span className="flex items-center justify-between gap-3">
                  {link.label}
                  {link.href === '/member/chat' && unreadCount > 0 ? (
                    <span className="min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[11px] font-bold leading-4 text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  ) : null}
                </span>
              </Link>
            ))}
          </nav>

          <button
            className="mt-8 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200"
            onClick={() => { logout(); window.location.href = '/login'; }}
          >
            Logout
          </button>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
