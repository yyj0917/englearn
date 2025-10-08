import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { type DontknowWord } from '../../types/word/word.types';

interface CheckWordCardProps {
  word: Pick<
    DontknowWord,
    'id' | 'word_en' | 'word_kr' | 'comment' | 'created_at' | 'is_checked'
  >;
  onDismiss?: () => void;
}

export function CheckWordCard({ word, onDismiss }: CheckWordCardProps) {
  const [isDismissing, setIsDismissing] = useState(false);
  const handleCancel = async () => {
    const { error } = await supabase
      .from('dontknow_word')
      .update({ is_checked: false })
      .eq('id', word.id);
    if (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`border-primary/40 relative rounded-lg border bg-white p-4 shadow-sm transition-all duration-300 ease-out ${
        isDismissing
          ? '-translate-x-full opacity-0'
          : 'translate-x-0 opacity-100'
      }`}
      onTransitionEnd={() => {
        if (isDismissing) onDismiss?.();
      }}
    >
      <div className='text-primary mb-1 flex items-center justify-between gap-1 text-sm'>
        <span>{new Date(word.created_at).toLocaleDateString()}</span>
        {word.is_checked && (
          <span className='bg-primary flex-center rounded-full p-0.5 text-sm text-white'>
            <Check className='h-4 w-4' />
          </span>
        )}
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
        <p className='text-sm text-gray-500'>💬 {word.comment}</p>
      )}
      <button
        className='absolute right-4 bottom-4 flex cursor-pointer items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-red-600 hover:bg-red-100'
        type='button'
        onClick={() => {
          if (isDismissing) return;
          setIsDismissing(true);
          void handleCancel();
        }}
        aria-label='취소'
      >
        <X className='h-4 w-4' />
        <span className='text-sm'>취소</span>
      </button>
    </div>
  );
}
