import { ListChecks, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';
import { type DontknowWord } from '../../types/word/word.types';
import { CheckWordCard } from './CheckWordCard';

type TableKey = 'dontknow_word' | 'jargon_word';

export function CheckWordSection() {
  const [words, setWords] = useState<DontknowWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = useAuthStore(s => s.userId);

  const [selectedTable] = useState<TableKey>('dontknow_word');

  useEffect(() => {
    let isMounted = true;
    const fetchWords = async () => {
      setLoading(true);
      setError(null);
      if (!userId) {
        if (!isMounted) return;
        setWords([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .eq('user_id', userId)
        .eq('is_checked', true)
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
  }, [selectedTable, userId]);

  return (
    <section className='space-y-4'>
      <h2 className='text-primary bg-primary/10 flex w-fit items-center rounded-lg border px-4 py-2 text-xl font-bold'>
        <ListChecks className='h-6 w-6' />
        <span className='ml-2'>확인한 단어</span>
      </h2>
      {loading && (
        <div className='flex-col-center gap-2 py-10 text-blue-600'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span className='ml-2 text-sm'>단어를 불러오는 중입니다...</span>
        </div>
      )}
      {error && (
        <div className='py-6 text-center text-sm text-red-600'>{error}</div>
      )}
      {words.length > 0 && !loading && !error && (
        <div className='grid grid-cols-1 gap-4'>
          {words.map(w => (
            <CheckWordCard
              key={`${w.user_id}-${w.id}`}
              word={w}
              onDismiss={() => {
                setWords(prev => prev.filter(x => x.id !== w.id));
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
