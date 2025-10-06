import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { type DontknowWord } from '../../types/word/word.types';
import { WordCard } from './WordCard';

type TableKey = 'dontknow_word' | 'jargon_word';

interface WordSectionProps {
  title?: string;
  table?: TableKey;
}

export function WordSection({
  title = '최근 단어',
  table = 'dontknow_word',
}: WordSectionProps) {
  const [words, setWords] = useState<DontknowWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchWords = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!isMounted) return;
      if (error) {
        setError('단어를 불러오지 못했습니다.');
      } else {
        setWords((data as unknown as DontknowWord[]) ?? []);
      }
      setLoading(false);
    };
    fetchWords();
    return () => {
      isMounted = false;
    };
  }, [table]);

  if (loading) {
    return (
      <div className='flex-col-center gap-2 py-10 text-blue-600'>
        <Loader2 className='h-6 w-6 animate-spin' />
        <span className='ml-2 text-sm'>단어를 불러오는 중입니다...</span>
      </div>
    );
  }

  if (error) {
    return <div className='py-6 text-center text-sm text-red-600'>{error}</div>;
  }

  if (words.length === 0) {
    return (
      <div className='py-6 text-center text-sm text-gray-500'>
        등록된 단어가 없습니다.
      </div>
    );
  }

  return (
    <section className='space-y-4'>
      <h2 className='text-primary border-primary bg-primary/10 w-fit rounded-lg border px-4 py-2 text-lg font-semibold'>
        {title}
      </h2>
      <div className='grid grid-cols-1 gap-4'>
        {words.map(w => (
          <WordCard key={`${w.user_id}-${w.id}`} word={w} />
        ))}
      </div>
    </section>
  );
}
