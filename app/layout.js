import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ChatNotificationProvider } from '@/context/ChatNotificationContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata = {
  title: 'Team Management Platform',
  description: 'Private team management dashboard for managers and members.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ChatNotificationProvider>{children}</ChatNotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
