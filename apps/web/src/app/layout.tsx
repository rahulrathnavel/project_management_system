import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/query-provider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Project Management System',
  description: 'Manage your projects and tasks',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23111827"/><text x="50" y="50" font-family="sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
