import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { SettingsForm } from './settings-form';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <SettingsForm currentUser={currentUser!} />
    </div>
  );
}
