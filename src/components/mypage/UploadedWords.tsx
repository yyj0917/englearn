import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';
import { type DontknowWord } from '../../types/word/word.types';

type TableKey = 'dontknow_word' | 'jargon_word';

interface UploadedWordsProps {
  table?: TableKey;
}

export function UploadedWords({ table = 'dontknow_word' }: UploadedWordsProps) {
  const userId = useAuthStore(s => s.userId);
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<DontknowWord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const count = words.length;

  const fetchWords = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      setError('단어를 불러오지 못했습니다.');
    } else {
      setWords((data as unknown as DontknowWord[]) ?? []);
    }
    setLoading(false);
  }, [table, userId]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleDelete = async (id: string) => {
    const prev = words;
    setWords(prev.filter(w => w.id !== id));
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', userId!);
    if (error) {
      // revert on error
      setWords(prev);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = async (id: string) => {
    const newComment = prompt(
      '새 코멘트를 입력하세요 (비워두면 삭제됩니다).',
      '',
    );
    if (newComment === null) return; // cancelled
    const { error } = await supabase
      .from(table)
      .update({ comment: newComment || null })
      .eq('id', id)
      .eq('user_id', userId!);
    if (error) {
      alert('수정 중 오류가 발생했습니다.');
      return;
    }
    setWords(ws =>
      ws.map(w => (w.id === id ? { ...w, comment: newComment || '' } : w)),
    );
  };

  if (!userId) {
    return (
      <div className='text-center text-sm text-gray-500'>
        로그인 후 확인할 수 있습니다.
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex-center py-6 text-blue-600'>
        <Loader2 className='h-5 w-5 animate-spin' />
        <span className='ml-2 text-sm'>불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return <div className='text-center text-sm text-red-600'>{error}</div>;
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>
          내가 등록한 단어
        </h2>
        <span className='text-sm text-gray-500'>총 {count}개</span>
      </div>
      {words.length === 0 ? (
        <div className='py-4 text-center text-sm text-gray-500'>
          등록된 단어가 없습니다.
        </div>
      ) : (
        <ul className='space-y-3'>
          {words.map(w => (
            <li key={w.id} className='rounded-md border border-gray-200 p-3'>
              <div className='mb-1 text-xs text-gray-400'>
                {new Date(w.created_at).toLocaleString()}
              </div>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='text-base font-semibold text-gray-900'>
                    {w.word_en}
                  </div>
                  <div className='text-sm text-gray-700'>
                    {Array.isArray(w.word_kr)
                      ? w.word_kr.join(', ')
                      : String(w.word_kr)}
                  </div>
                  {w.comment && (
                    <div className='mt-1 text-xs text-gray-500'>
                      💬 {w.comment}
                    </div>
                  )}
                </div>
                <div className='flex shrink-0 items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => handleEdit(w.id)}
                    className='rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50'
                    aria-label='Edit word'
                  >
                    <Pencil className='h-4 w-4' />
                  </button>
                  <button
                    type='button'
                    onClick={() => handleDelete(w.id)}
                    className='rounded-md border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100'
                    aria-label='Delete word'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
