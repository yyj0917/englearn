import { useLocation, useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/login') return null;

  return (
    <header className='mobile-area fixed top-0 right-0 left-0 z-50 bg-white'>
      <button
        className='text-primary !font-OngleebDaisy cursor-pointer rounded-4xl pt-6 pl-6 text-4xl font-bold'
        onClick={() => navigate('/')}
      >
        잉런
      </button>
    </header>
  );
}
