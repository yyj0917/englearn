import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';
export function Logout() {
  const clear = useAuthStore(s => s.clear);
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    clear();
    navigate('/login');
  };

  return (
    <button
      type='button'
      onClick={handleLogout}
      className='w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100'
    >
      로그아웃
    </button>
  );
}
