'use client';

import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, FolderKanban, CheckSquare, Menu, X, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ];

  if (user.role === 'ADMIN') {
    navItems.push({ name: 'Audit Logs', href: '/audit', icon: ShieldAlert });
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-gray-900 text-white flex items-center justify-center font-bold">
            P
          </div>
          <span className="text-lg font-bold">PMS</span>
        </div>
        <button 
          className="md:hidden p-2 -mr-2 text-gray-500 hover:text-gray-900"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-gray-200 mt-6">
        <div className="px-3 flex flex-col space-y-1 mb-4">
          <span className="text-sm font-medium text-gray-900 truncate">{user.fullName}</span>
          <span className="text-xs text-gray-500 truncate">{user.email}</span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 w-fit mt-1">
            {user.role}
          </span>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-gray-900 text-white flex items-center justify-center font-bold">
            P
          </div>
          <span className="text-lg font-bold">PMS</span>
        </div>
        <button 
          className="p-2 -mr-2 text-gray-500 hover:text-gray-900"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 px-4 py-6 flex-col sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar Content */}
      <aside className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white px-4 py-6 flex-col overflow-y-auto transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
