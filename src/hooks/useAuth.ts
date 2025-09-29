import { type User, AuthError } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 초기 세션 확인
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('세션 확인 에러:', error)
      } else {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    }

    getSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Supabase는 이메일 확인이 필요할 수 있음
      if (data.user && !data.session) {
        setError('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
      }

      return data.user
    } catch (error: unknown) {
      const errorMessage = getAuthErrorMessage(error as AuthError)
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return data.user
    } catch (error: unknown) {
      const errorMessage = getAuthErrorMessage(error as AuthError)
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: unknown) {
      setError('로그아웃에 실패했습니다.')
      throw error
    }
  }

  const kakaoLogin = async () => {
    try {
      setError(null)
      setLoading(true)
      await supabase.auth.signInWithOAuth({
        provider: 'kakao',
      })
    } catch (error: unknown) {
      const errorMessage = getAuthErrorMessage(error as AuthError)
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    kakaoLogin
  }
}

// Supabase Auth 에러 메시지 한국어 변환
const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    case 'User already registered':
      return '이미 가입된 이메일입니다.'
    case 'Password should be at least 6 characters':
      return '비밀번호는 6자리 이상이어야 합니다.'
    case 'Invalid email':
      return '유효하지 않은 이메일 형식입니다.'
    case 'Email not confirmed':
      return '이메일 인증을 완료해주세요.'
    default:
      return error.message || '인증 중 오류가 발생했습니다.'
  }
}