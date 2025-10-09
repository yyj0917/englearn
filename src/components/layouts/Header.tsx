import { Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearchStore } from '../../store/search-store';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useSearchStore(s => s.query);
  const setQuery = useSearchStore(s => s.setQuery);

  if (location.pathname === '/login') return null;

  return (
    <header className='mobile-area fixed top-0 right-0 left-0 z-50 bg-white'>
      <div className='flex items-center gap-3 px-6 pt-5 pb-3'>
        <button
          className='text-primary !font-OngleebDaisy cursor-pointer rounded-4xl text-4xl font-bold'
          onClick={() => navigate('/')}
        >
          잉런
        </button>
        {location.pathname !== '/mypage' &&
          location.pathname !== '/word-upload' && (
            <div className='relative ml-auto w-1/2'>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='단어 검색'
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
              <Search
                className='text-primary absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2'
                strokeWidth={3}
              />
            </div>
          )}
      </div>
    </header>
  );
}
