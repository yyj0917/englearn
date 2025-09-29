import { ArrowDownIcon } from 'lucide-react'
import { useState } from 'react'
import KakaoLogo from '../../assets/kakao-logo.svg'
import { useSupabaseAuth } from '../../hooks/useAuth'
export function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { kakaoLogin } = useSupabaseAuth()

  const handleKakaoLogin = async () => {
    await kakaoLogin()
    const data = localStorage.getItem('sb-wafrlwwyyjckpmcxxzgt-auth-token')
    console.log(data)
  }

  return (
    <div className="w-full h-screen flex-center">
      <div className="p-8 w-full ">
        <img src={"src/assets/img/main-logo.png"} alt="logo" className="object-contain" />
        <div className='flex-col-center gap-4'>
          <ArrowDownIcon className='size-12 opacity-80 text-primary animate-bounce'/>
          <p className='text-center text-md text-gray-500'>
            영어 단어 기록하고 공부하기 잉런~
          </p>
          <button className='kakao-btn cursor-pointer' onClick={handleKakaoLogin}>
              <KakaoLogo />
              <span className='kakao-btn-text'>카카오로 시작하기</span>
          </button>
        </div>
      </div>
    </div>
  )
}