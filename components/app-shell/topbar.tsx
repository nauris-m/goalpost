'use client';

import Link from 'next/link';
import { Bell, Flag, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggleButton } from './theme-toggle-button';
import { useUnreadNotificationCount } from '@/lib/queries/use-notifications';
import type { AuthUser } from '@/lib/types/domain';

export function Topbar({ currentUser, onMenuToggle }: { currentUser: AuthUser; onMenuToggle: () => void }) {
  const unreadCount = useUnreadNotificationCount(currentUser);

  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle} aria-label="Toggle menu">
        <Menu className="size-5" />
      </Button>
      <span className="flex items-center gap-2 font-bold text-primary lg:hidden">
        <Flag className="size-4" /> Goalpost
      </span>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggleButton />
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
          render={<Link href="/notifications" />}
          nativeButton={false}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-destructive" />}
        </Button>
      </div>
    </header>
  );
}
