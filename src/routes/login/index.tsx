import { ArrowDownIcon } from 'lucide-react';
import KakaoLogo from '../../assets/kakao-logo.svg';
import { useSupabaseAuth } from '../../hooks/useAuth';
export function Login() {
  const { kakaoLogin } = useSupabaseAuth();

  const handleKakaoLogin = async () => {
    await kakaoLogin();
    const data = localStorage.getItem('sb-wafrlwwyyjckpmcxxzgt-auth-token');
    console.log(data);
  };

  return (
    <div className='flex-center h-screen w-full'>
      <div className='w-full p-8'>
        <img
          src={'/assets/img/main-logo.png'}
          alt='logo'
          className='object-contain'
        />
        <div className='flex-col-center gap-4'>
          <ArrowDownIcon className='text-primary size-12 animate-bounce opacity-80' />
          <p className='text-md text-center text-gray-500'>
            영어 단어 기록하고 공부하기 잉런~
          </p>
          <button
            className='kakao-btn cursor-pointer'
            onClick={handleKakaoLogin}
          >
            <KakaoLogo />
            <span className='kakao-btn-text'>카카오로 시작하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
