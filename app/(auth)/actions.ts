'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface AuthActionState {
  error: string | null;
  info: string | null;
}

const INITIAL_STATE: AuthActionState = { error: null, info: null };

export async function signIn(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Email and password are required.', info: null };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message, info: null };

  redirect('/');
}

export async function signUp(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  if (!email || !password) return { error: 'Email and password are required.', info: null };
  if (!name || !title) return { error: 'Name and title are required.', info: null };
  if (password.length < 6) return { error: 'Password must be at least 6 characters.', info: null };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message, info: null };

  if (!data.session) {
    return { ...INITIAL_STATE, info: 'Check your inbox to confirm your email, then sign in.' };
  }

  const { error: claimError } = await supabase.rpc('claim_or_create_profile', { p_name: name, p_title: title });
  if (claimError) return { error: claimError.message, info: null };

  redirect('/');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/sign-in');
}
