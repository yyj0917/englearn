import { Home, Upload, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  {
    path: '/',
    label: '홈',
    icon: Home,
  },
  {
    path: '/word-upload',
    label: '단어 업로드',
    icon: Upload,
  },
  {
    path: '/mypage',
    label: '마이페이지',
    icon: User,
  },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (location.pathname === '/login') return null;
  return (
    <nav className='mobile-area fixed right-0 bottom-0 left-0 z-50 border-t border-gray-300 bg-white'>
      <div className='flex items-center justify-around py-2'>
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center px-4 py-2 transition-colors duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon
                className={`mb-1 h-6 w-6 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
