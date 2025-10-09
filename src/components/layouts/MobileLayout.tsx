import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore(s => s.setSession);
  const clear = useAuthStore(s => s.clear);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sync = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      // Simple but effective validation: check for essential session data
      if (!session || !session.access_token || !session.user?.id) {
        clear();
        localStorage.clear();
        if (location.pathname !== '/login')
          navigate('/login', { replace: true });
        return;
      }

      // Check if token is expired (simple check)
      if (session.expires_at && session.expires_at < Date.now() / 1000) {
        clear();
        localStorage.clear();

        if (location.pathname !== '/login')
          navigate('/login', { replace: true });
        return;
      }

      // Session is valid, update store
      const meta = (session.user?.user_metadata ?? {}) as {
        avatar_url?: string;
        user_name?: string;
        full_name?: string;
        email?: string;
      };

      setSession({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at ? String(session.expires_at) : null,
        userId: session.user.id,
        email: session.user.email ?? meta.email ?? null,
        provider:
          (session.user.app_metadata as { provider?: string } | undefined)
            ?.provider ?? null,
        avatarUrl: meta.avatar_url ?? null,
        userName: meta.user_name ?? meta.full_name ?? null,
      });
    };

    sync();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Same validation logic for auth state changes
        if (!session || !session.access_token || !session.user?.id) {
          clear();
          localStorage.clear();

          if (location.pathname !== '/login')
            navigate('/login', { replace: true });
          return;
        }

        if (session.expires_at && session.expires_at < Date.now() / 1000) {
          clear();
          localStorage.clear();

          if (location.pathname !== '/login')
            navigate('/login', { replace: true });
          return;
        }

        const meta = (session.user?.user_metadata ?? {}) as {
          avatar_url?: string;
          user_name?: string;
          full_name?: string;
          email?: string;
        };

        setSession({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at ? String(session.expires_at) : null,
          userId: session.user.id,
          email: session.user.email ?? meta.email ?? null,
          provider:
            (session.user.app_metadata as { provider?: string } | undefined)
              ?.provider ?? null,
          avatarUrl: meta.avatar_url ?? null,
          userName: meta.user_name ?? meta.full_name ?? null,
        });
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setSession, clear, navigate, location.pathname]);
  return (
    <div className='mobile-area h-screen overflow-hidden bg-white'>
      {location.pathname !== '/login' ? (
        <div className='custom-scrollbar h-full overflow-y-auto pt-16 pb-24'>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
