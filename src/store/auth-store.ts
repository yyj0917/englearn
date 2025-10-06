import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
}

interface UserState {
  userId: string | null;
  email: string | null;
  provider: string | null;
  avatarUrl: string | null;
  userName: string | null;
}

interface AuthState extends TokenState, UserState {
  setSession: (args: {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: string | null;
    userId: string | null;
    email: string | null;
    provider: string | null;
    avatarUrl?: string | null;
    userName?: string | null;
  }) => void;
  clear: () => void;
  syncFromSupabase: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  userId: null,
  email: null,
  provider: null,
  avatarUrl: null,
  userName: null,
  setSession: ({
    accessToken,
    refreshToken,
    expiresAt,
    userId,
    email,
    provider,
    avatarUrl,
    userName,
  }) =>
    set({
      accessToken,
      refreshToken,
      expiresAt,
      userId,
      email,
      provider,
      avatarUrl: avatarUrl ?? null,
      userName: userName ?? null,
    }),
  clear: () =>
    set({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      userId: null,
      email: null,
      provider: null,
      avatarUrl: null,
      userName: null,
    }),
  syncFromSupabase: async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) {
      set({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        userId: null,
        email: null,
        provider: null,
        avatarUrl: null,
        userName: null,
      });
      return;
    }
    const meta = (session.user?.user_metadata ?? {}) as {
      avatar_url?: string;
      user_name?: string;
      full_name?: string;
      email?: string;
    };
    set({
      accessToken: session.access_token ?? session?.access_token ?? null,
      refreshToken: session.refresh_token ?? null,
      expiresAt: session.expires_at ? String(session.expires_at) : null,
      userId: session.user?.id ?? null,
      email: session.user?.email ?? meta.email ?? null,
      provider:
        (session.user?.app_metadata as { provider?: string } | undefined)
          ?.provider ?? null,
      avatarUrl: meta.avatar_url ?? null,
      userName: meta.user_name ?? meta.full_name ?? null,
    });
  },
}));
