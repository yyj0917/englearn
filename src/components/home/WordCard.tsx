import { Check } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { type WordData } from '../../types/word/word.types';

interface WordCardProps {
  word: Pick<
    WordData,
    | 'id'
    | 'word_en'
    | 'word_kr'
    | 'comment'
    | 'created_at'
    | 'is_checked'
    | 'major_name'
  >;
  onDismiss?: () => void;
  table?: 'dontknow_word' | 'major_word';
}

export function WordCard({
  word,
  onDismiss,
  table = 'dontknow_word',
}: WordCardProps) {
  const [isDismissing, setIsDismissing] = useState(false);
  const handleCheck = async () => {
    const { error } = await supabase
      .from(table)
      .update({ is_checked: true })
      .eq('id', word.id);
    if (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`border-primary/40 relative flex flex-col rounded-lg border bg-white p-4 shadow-sm transition-all duration-300 ease-out ${
        isDismissing
          ? 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100'
      }`}
      onTransitionEnd={() => {
        if (isDismissing) onDismiss?.();
      }}
    >
      <div className='text-primary mb-1 flex items-center justify-between text-sm'>
        <span>{new Date(word.created_at).toLocaleDateString()}</span>
        {word.major_name && <span>{word.major_name}</span>}
      </div>
      <h3 className='mb-2 text-xl font-bold text-gray-900'>{word.word_en}</h3>
      <ul className='mb-2 list-inside list-disc text-gray-700'>
        {Array.isArray(word.word_kr) ? (
          word.word_kr.map((m, i) => (
            <li key={i} className='text-sm'>
              {m}
            </li>
          ))
        ) : (
          <li className='text-sm'>{String(word.word_kr)}</li>
        )}
      </ul>
      {word.comment && (
        <div className='text-sm break-words whitespace-pre-wrap text-gray-500'>
          💬 {word.comment}
        </div>
      )}
      <button
        className='bg-primary/10 text-primary border-primary hover:bg-primary/20 mt-4 ml-auto flex w-fit cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5'
        type='button'
        onClick={() => {
          if (isDismissing) return;
          setIsDismissing(true);
          void handleCheck();
        }}
        aria-label='확인'
      >
        <Check className='h-4 w-4' />
        <span className='text-sm'>확인</span>
      </button>
    </div>
  );
}
