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
      if (!session || !session.access_token) {
        clear();
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
        accessToken: session.access_token ?? null,
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
    };
    sync();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session || !session.access_token) {
          clear();
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
          accessToken: session.access_token ?? null,
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
