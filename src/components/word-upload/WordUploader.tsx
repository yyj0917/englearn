import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';
import { type CreateDontknowWordData } from '../../types/word/word.types';
import { WordForm } from './WordForm';

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
}

export function WordUploader() {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
  });
  const userId = useAuthStore(s => s.userId);
  const isAuthenticated = useMemo(() => Boolean(userId), [userId]);
  const [targetTable] = useState<'dontknow_word' | 'jargon_word'>(
    'dontknow_word',
  );

  const handleWordSubmit = async (
    wordData: Omit<CreateDontknowWordData, 'user_id'>,
  ) => {
    setUploadState({ status: 'uploading' });

    try {
      if (!userId) {
        setUploadState({
          status: 'error',
          message: '로그인 정보가 없습니다. 다시 로그인 후 시도해주세요.',
        });
        return;
      }

      const target = wordData.category ?? targetTable;
      const { error } = await supabase
        .from(target)
        .insert([
          {
            ...wordData,
            user_id: userId,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      setUploadState({
        status: 'success',
        message: '단어가 성공적으로 추가되었습니다!',
      });

      // 3초 후 상태 초기화
      setTimeout(() => {
        setUploadState({ status: 'idle' });
      }, 3000);
    } catch (error) {
      console.error('단어 업로드 오류:', error);
      setUploadState({
        status: 'error',
        message: '단어 업로드 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  const renderStatusMessage = () => {
    if (uploadState.status === 'uploading') {
      return (
        <div className='flex items-center justify-center space-x-2 text-blue-600'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span>단어를 업로드하고 있습니다...</span>
        </div>
      );
    }

    if (uploadState.status === 'success') {
      return (
        <div className='flex items-center justify-center space-x-2 text-green-600'>
          <CheckCircle className='h-5 w-5' />
          <span>{uploadState.message}</span>
        </div>
      );
    }

    if (uploadState.status === 'error') {
      return (
        <div className='flex items-center justify-center space-x-2 text-red-600'>
          <AlertCircle className='h-5 w-5' />
          <span>{uploadState.message}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className='mx-auto w-full max-w-2xl p-6'>
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-gray-800'>
          새로운 단어 추가
        </h1>
        <p className='text-gray-600'>영어 단어와 한글 뜻을 입력해주세요</p>
      </div>

      {/* 테이블 선택은 WordForm 내부에서 처리 */}

      {/* 상태 메시지 */}
      {renderStatusMessage() && (
        <div className='mb-6 rounded-lg bg-gray-50 p-4'>
          {renderStatusMessage()}
        </div>
      )}

      {/* 폼 */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        {isAuthenticated ? (
          <WordForm
            onSubmit={handleWordSubmit}
            isLoading={uploadState.status === 'uploading'}
            category={targetTable}
          />
        ) : (
          <div className='text-center text-sm text-red-600'>
            로그인 후 단어를 업로드할 수 있습니다.
          </div>
        )}
      </div>

      {/* 도움말 */}
      <div className='mt-8 text-center text-sm text-gray-500'>
        <p>
          💡 <strong>팁:</strong> 카테고리와 코멘트는 선택사항입니다.
        </p>
        <p>
          카테고리로 단어를 분류하고, 코멘트로 기억하기 쉬운 팁을 남겨보세요!
        </p>
      </div>
    </div>
  );
}
