'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp, type AuthActionState } from '../actions';

const INITIAL_STATE: AuthActionState = { error: null, info: null };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" type="text" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">Position / Title</Label>
        <Input id="title" name="title" type="text" required />
      </div>
      <p className="text-xs text-muted-foreground">
        If a manager already invited you by this email, signing up links your account to that invite. Otherwise
        you&apos;ll start a new workspace as a manager.
      </p>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={6} required />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.info && <p className="text-sm text-success">{state.info}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
