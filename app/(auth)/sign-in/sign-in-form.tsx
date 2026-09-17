'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, type AuthActionState } from '../actions';

const INITIAL_STATE: AuthActionState = { error: null, info: null };

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link href="/sign-up" className="font-medium text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </form>
  );
}
