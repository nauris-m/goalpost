import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { AppShell } from '@/components/app-shell/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) redirect('/sign-in');

  return <AppShell currentUser={currentUser}>{children}</AppShell>;
}
