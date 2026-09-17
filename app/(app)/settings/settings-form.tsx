'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { CircleCheck, Moon, Sun, SunMoon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { signOut } from '@/app/(auth)/actions';
import { useUpdateProfileMutation } from '@/lib/queries/use-profile';
import { useLogActivity } from '@/lib/queries/use-notifications';
import type { AuthUser } from '@/lib/types/domain';

export function SettingsForm({ currentUser }: { currentUser: AuthUser }) {
  const { theme, setTheme } = useTheme();
  const updateProfile = useUpdateProfileMutation();
  const logActivity = useLogActivity();

  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title);
  const [contactInfo, setContactInfo] = useState(currentUser.contactInfo);
  const [savedJustNow, setSavedJustNow] = useState(false);

  // next-themes only knows the real theme after client mount - reading `theme` before
  // that would render server/client differently and cause a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const activeTheme = mounted ? theme : undefined;

  function saveProfile() {
    if (!name.trim() || !title.trim()) return;
    updateProfile.mutate(
      { profileId: currentUser.id, fields: { name: name.trim(), title: title.trim(), contactInfo: contactInfo.trim() } },
      {
        onSuccess: () => {
          setSavedJustNow(true);
          setTimeout(() => setSavedJustNow(false), 2000);
          logActivity({
            actorId: currentUser.id,
            actorName: name.trim(),
            verb: 'profile.updated',
            summary: 'updated their profile.',
            targetTeamId: null,
          });
        },
        onError: () => toast.error('Failed to save changes.'),
      },
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          <p className="mb-2 mt-3 text-xs text-muted-foreground">Theme</p>
          <div className="inline-flex gap-1 rounded-lg border border-border bg-muted p-1">
            <Button type="button" variant={activeTheme === 'light' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTheme('light')}>
              <Sun className="size-4" /> Light
            </Button>
            <Button type="button" variant={activeTheme === 'dark' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTheme('dark')}>
              <Moon className="size-4" /> Dark
            </Button>
            <Button type="button" variant={activeTheme === 'system' ? 'secondary' : 'ghost'} size="sm" onClick={() => setTheme('system')}>
              <SunMoon className="size-4" /> Auto
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Account</h2>
          <p className="mb-3 mt-3 text-xs text-muted-foreground">
            Signed in as {currentUser.email} · {currentUser.role}
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
              Log out
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Your profile</h2>
        <div className="mt-3 flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Position / Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Contact info</Label>
            <Input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Email or phone" />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" disabled={!name.trim() || !title.trim()} onClick={saveProfile}>
              Save changes
            </Button>
            {savedJustNow && (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <CircleCheck className="size-3.5" /> Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
