import type { LucideIcon } from 'lucide-react';
import { Bell, Flag, LayoutDashboard, Settings, Target, UserRound, Users } from 'lucide-react';

export type NavIconName = 'overview' | 'teams' | 'members' | 'goals' | 'okrs' | 'notifications' | 'settings';

export const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  overview: LayoutDashboard,
  teams: Users,
  members: UserRound,
  goals: Flag,
  okrs: Target,
  notifications: Bell,
  settings: Settings,
};

export interface NavItem {
  readonly label: string;
  readonly icon: NavIconName;
  readonly link: string;
  readonly badge?: number;
}

export interface NavGroup {
  readonly label: string;
  readonly items: readonly NavItem[];
}
