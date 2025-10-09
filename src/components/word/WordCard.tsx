import { type WordData } from '../../types/word/word.types';

interface WordCardProps {
  word: Pick<
    WordData,
    'word_en' | 'word_kr' | 'comment' | 'created_at' | 'major_name'
  >;
}

export function WordCard({ word }: WordCardProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
      <div className='mb-1 text-xs text-gray-400'>
        {new Date(word.created_at).toLocaleDateString()}
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
    </div>
  );
}
