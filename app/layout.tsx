import type { Metadata } from 'next';
import { AppProvider } from './providers/AppProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'App',
  description: 'AI Repo Template',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
