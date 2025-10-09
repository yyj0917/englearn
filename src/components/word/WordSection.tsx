import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useSearchStore } from '../../store/search-store';
import { type WordData } from '../../types/word/word.types';
import { WordCard } from './WordCard';

type TableKey = 'dontknow_word' | 'major_word';

interface WordSectionProps {
  title?: string;
  table?: TableKey;
}

export function WordSection({
  title = '최근 단어',
  table = 'dontknow_word',
}: WordSectionProps) {
  const [words, setWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const query = useSearchStore(s => s.query)
    .trim()
    .toLowerCase();

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
        setWords((data as unknown as WordData[]) ?? []);
      }
      setLoading(false);
    };
    fetchWords();
    return () => {
      isMounted = false;
    };
  }, [table]);

  const filtered = useMemo(() => {
    if (!query) return words;
    return words.filter(w => {
      const en = w.word_en.toLowerCase();
      const kr = Array.isArray(w.word_kr)
        ? w.word_kr.join(',')
        : String(w.word_kr);
      return en.includes(query) || kr.includes(query);
    });
  }, [words, query]);

  if (loading) {
    return (
      <div className='flex-center py-10 text-blue-600'>
        <Loader2 className='h-6 w-6 animate-spin' />
        <span className='ml-2 text-sm'>불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return <div className='py-6 text-center text-sm text-red-600'>{error}</div>;
  }

  if (filtered.length === 0) {
    return (
      <div className='py-6 text-center text-sm text-gray-500'>
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <section className='space-y-4'>
      <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
      <div className='grid grid-cols-1 gap-4'>
        {filtered.map(w => (
          <WordCard key={`${w.user_id}-${w.id}`} word={w} />
        ))}
      </div>
    </section>
  );
}
