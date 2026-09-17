'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ICONS, type NavGroup } from './sidebar-nav';
import { useUnreadNotificationCount } from '@/lib/queries/use-notifications';
import type { AuthUser } from '@/lib/types/domain';

export function Sidebar({
  open,
  currentUser,
  onNavigate,
}: {
  open: boolean;
  currentUser: AuthUser;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const unreadCount = useUnreadNotificationCount(currentUser);
  const isManager = currentUser.role === 'manager';

  const navGroups: readonly NavGroup[] = [
    {
      label: 'Main',
      items: isManager
        ? [
            { label: 'Overview', icon: 'overview', link: '/' },
            { label: 'Teams', icon: 'teams', link: '/teams' },
            { label: 'Members', icon: 'members', link: '/members' },
            { label: 'OKRs', icon: 'okrs', link: '/okrs' },
            { label: 'My Goals', icon: 'goals', link: '/my-goals' },
          ]
        : [{ label: 'My Goals', icon: 'goals', link: '/my-goals' }],
    },
    {
      label: 'General',
      items: [
        { label: 'Notifications', icon: 'notifications', link: '/notifications', badge: unreadCount > 0 ? unreadCount : undefined },
        { label: 'Settings', icon: 'settings', link: '/settings' },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-[1030] flex w-64 -translate-x-full flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
        open && 'translate-x-0',
      )}
    >
      <div className="flex h-16 items-center gap-2 px-5 text-primary">
        <Flag className="size-5" />
        <span className="text-lg font-bold text-sidebar-foreground">Goalpost</span>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={groupIndex > 0 ? 'mt-5' : undefined}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
            {group.items.map((item) => {
              const Icon = NAV_ICONS[item.icon];
              const active = item.link === '/' ? pathname === '/' : pathname.startsWith(item.link);
              return (
                <Link
                  key={item.link}
                  href={item.link}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent',
                    active && 'bg-sidebar-primary font-medium text-sidebar-primary-foreground hover:bg-sidebar-primary',
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="size-4" />
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar px-3 py-2.5 hover:bg-sidebar-accent"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            {currentUser.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-sidebar-foreground">{currentUser.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{currentUser.title}</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
