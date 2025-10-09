import { type User, AuthError } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';

// Enhanced auth hook for session management
// export const useAuth = () => {
//   const setSession = useAuthStore(s => s.setSession);
//   const clear = useAuthStore(s => s.clear);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isInitialized, setIsInitialized] = useState(false);

//   // Enhanced session validation with proper token checking
//   const validateSession = async (session: Session): Promise<boolean> => {
//     if (!session || !session.access_token) {
//       return false;
//     }

//     // Check if token is expired
//     if (session.expires_at && session.expires_at < Date.now() / 1000) {
//       console.log('Token expired, attempting refresh...');
//       try {
//         const { data: refreshData, error: refreshError } =
//           await supabase.auth.refreshSession();
//         if (refreshError || !refreshData.session) {
//           console.error('Token refresh failed:', refreshError);
//           return false;
//         }
//         // Update session with refreshed data
//         session = refreshData.session;
//       } catch (error) {
//         console.error('Token refresh error:', error);
//         return false;
//       }
//     }

//     // Validate user ID exists
//     if (!session.user?.id) {
//       console.error('No user ID in session');
//       return false;
//     }

//     // Test token validity by making a simple API call
//     try {
//       const { error } = await supabase
//         .from('dontknow_word')
//         .select('id')
//         .limit(1);

//       if (error && error.message.includes('JWT')) {
//         console.error('Invalid JWT token:', error);
//         return false;
//       }
//     } catch (error) {
//       console.error('Token validation failed:', error);
//       return false;
//     }

//     return true;
//   };

//   const handleAuthStateChange = async (
//     event: string,
//     session: Session | null,
//   ) => {
//     console.log('Auth state change:', event, !!session);
//     if (!session) {
//       return;
//     }
//     const isValid = await validateSession(session as Session);

//     if (!isValid) {
//       console.log('Invalid session, clearing auth and redirecting to login');
//       clear();
//       if (location.pathname !== '/login') {
//         navigate('/login', { replace: true });
//       }
//       return;
//     }

//     // Session is valid, update store
//     const meta = (session.user?.user_metadata ?? {}) as {
//       avatar_url?: string;
//       user_name?: string;
//       full_name?: string;
//       email?: string;
//     };

//     setSession({
//       accessToken: session.access_token,
//       refreshToken: session.refresh_token,
//       expiresAt: session.expires_at ? String(session.expires_at) : null,
//       userId: session.user.id,
//       email: session.user.email ?? meta.email ?? null,
//       provider:
//         (session.user.app_metadata as { provider?: string })?.provider ?? null,
//       avatarUrl: meta.avatar_url ?? null,
//       userName: meta.user_name ?? meta.full_name ?? null,
//     });
//   };

//   const initializeAuth = async () => {
//     try {
//       console.log('Initializing auth...');
//       const { data } = await supabase.auth.getSession();
//       await handleAuthStateChange('INITIAL_SESSION', data.session);
//       setIsInitialized(true);
//     } catch (error) {
//       console.error('Auth initialization error:', error);
//       clear();
//       navigate('/login', { replace: true });
//       setIsInitialized(true);
//     }
//   };

//   const setupAuthListener = () => {
//     const { data: listener } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         console.log('Auth state change event:', event);
//         await handleAuthStateChange(event, session);
//       },
//     );

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   };

//   return {
//     isInitialized,
//     initializeAuth,
//     setupAuthListener,
//     validateSession,
//   };
// };

// Legacy auth hook for login/signup functionality
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const clearAuthStore = useAuthStore(state => state.clear);

  useEffect(() => {
    // 초기 세션 확인
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('세션 확인 에러:', error);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    getSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Supabase는 이메일 확인이 필요할 수 있음
      if (data.user && !data.session) {
        setError('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
      }

      return data.user;
    } catch (error: unknown) {
      const errorMessage = getAuthErrorMessage(error as AuthError);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data.user;
    } catch (error: unknown) {
      const errorMessage = getAuthErrorMessage(error as AuthError);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear localStorage
      localStorage.clear();

      // Clear auth store
      clearAuthStore();

      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error: unknown) {
      setError('로그아웃에 실패했습니다.');
      throw error;
    }
  };

  const kakaoLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: 'kakao',
      });
    } catch (error: unknown) {
      const errorMessage = getAuthErrorMessage(error as AuthError);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    kakaoLogin,
  };
};

// Supabase Auth 에러 메시지 한국어 변환
const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    case 'User already registered':
      return '이미 가입된 이메일입니다.';
    case 'Password should be at least 6 characters':
      return '비밀번호는 6자리 이상이어야 합니다.';
    case 'Invalid email':
      return '유효하지 않은 이메일 형식입니다.';
    case 'Email not confirmed':
      return '이메일 인증을 완료해주세요.';
    default:
      return error.message || '인증 중 오류가 발생했습니다.';
  }
};
