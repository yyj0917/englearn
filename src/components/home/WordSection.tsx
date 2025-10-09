import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';
import { useSearchStore } from '../../store/search-store';
import { type WordData } from '../../types/word/word.types';
import { WordCard } from './WordCard';

type TableKey = 'dontknow_word' | 'major_word';
type MajorCategory = { id: string; major_name: string };

export function WordSection() {
  const [words, setWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = useAuthStore(s => s.userId);

  const [selectedTable, setSelectedTable] = useState<TableKey>('dontknow_word');
  const [majorCategories, setMajorCategories] = useState<MajorCategory[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<string>('all');

  const query = useSearchStore(s => s.query)
    .trim()
    .toLowerCase();

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
      let query = supabase
        .from(selectedTable)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Only show unchecked for unknown words list
      if (selectedTable === 'dontknow_word') {
        query = query.eq('is_checked', false);
      }

      // Filter by selected major when viewing major words
      if (selectedTable === 'major_word' && selectedMajor !== 'all') {
        query = query.eq('major_name', selectedMajor);
      }

      const { data, error } = await query;
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
  }, [selectedTable, userId, selectedMajor]);

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
  // Load user's major categories when switching to major_word
  useEffect(() => {
    let isMounted = true;
    const fetchMajors = async () => {
      if (selectedTable !== 'major_word' || !userId) return;
      const { data, error } = await supabase
        .from('major_category')
        .select('id, major_name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!isMounted) return;
      if (!error) {
        setMajorCategories((data as unknown as MajorCategory[]) ?? []);
      }
    };
    fetchMajors();
    return () => {
      isMounted = false;
    };
  }, [selectedTable, userId]);

  return (
    <section className='space-y-4'>
      <nav className='flex gap-2'>
        <button
          className={`bg-primary/10 w-fit flex-1 rounded-lg border px-4 py-2 text-lg font-semibold ${selectedTable === 'dontknow_word' ? 'bg-primary/10 text-primary border-primary' : 'border-gray-500 bg-white text-gray-500'}`}
          onClick={() => setSelectedTable('dontknow_word')}
        >
          모르는 단어
        </button>
        <button
          className={`bg-primary/10 w-fit flex-1 rounded-lg border px-4 py-2 text-lg font-semibold ${selectedTable === 'major_word' ? 'bg-primary/10 text-primary border-primary' : 'border-gray-500 bg-white text-gray-500'}`}
          onClick={() => setSelectedTable('major_word')}
        >
          전공 용어
        </button>
      </nav>
      {selectedTable === 'major_word' && (
        <nav className='flex flex-wrap gap-2'>
          <button
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              selectedMajor === 'all'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
            onClick={() => setSelectedMajor('all')}
          >
            전체
          </button>
          {majorCategories.map(c => (
            <button
              key={c.id}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                selectedMajor === c.major_name
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
              onClick={() => setSelectedMajor(c.major_name)}
            >
              {c.major_name}
            </button>
          ))}
        </nav>
      )}
      {loading && (
        <div className='flex-col-center gap-2 py-10 text-blue-600'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span className='ml-2 text-sm'>단어를 불러오는 중입니다...</span>
        </div>
      )}
      {error && (
        <div className='py-6 text-center text-sm text-red-600'>{error}</div>
      )}
      {filtered.length === 0 && !loading && !error && (
        <div className='py-6 text-center text-sm text-gray-500'>
          단어가 없습니다.
        </div>
      )}
      {filtered.length > 0 && !loading && !error && (
        <div className='grid grid-cols-1 gap-4'>
          {filtered.map(w => (
            <WordCard
              key={`${w.user_id}-${w.id}`}
              word={w}
              table={selectedTable}
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
