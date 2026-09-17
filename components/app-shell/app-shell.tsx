'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Footer } from './footer';
import type { AuthUser } from '@/lib/types/domain';

export function AppShell({ currentUser, children }: { currentUser: AuthUser; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} currentUser={currentUser} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="fixed inset-0 z-[1020] bg-black/35 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar currentUser={currentUser} onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 p-6 sm:p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
