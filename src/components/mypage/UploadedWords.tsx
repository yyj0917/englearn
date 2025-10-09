import { Check, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';
import { type WordData } from '../../types/word/word.types';

type TableKey = 'dontknow_word' | 'major_word';

interface EditState {
  id: string | null;
  word_en: string;
  word_kr: string[];
  comment: string;
  category: string;
}

export function UploadedWords() {
  const userId = useAuthStore(s => s.userId);
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<WordData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableKey>('dontknow_word');
  const [editingWord, setEditingWord] = useState<EditState | null>(null);

  const count = words.length;

  const fetchWords = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from(selectedTable)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      setError('단어를 불러오지 못했습니다.');
    } else {
      setWords((data as unknown as WordData[]) ?? []);
    }
    setLoading(false);
  }, [selectedTable, userId]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 단어를 삭제하시겠습니까?')) return;

    const prev = words;
    setWords(prev.filter(w => w.id !== id));
    const { error } = await supabase
      .from(selectedTable)
      .delete()
      .eq('id', id)
      .eq('user_id', userId!);
    if (error) {
      // revert on error
      setWords(prev);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (word: WordData) => {
    setEditingWord({
      id: word.id,
      word_en: word.word_en,
      word_kr: Array.isArray(word.word_kr)
        ? word.word_kr
        : [String(word.word_kr)],
      comment: word.comment || '',
      category: word.category || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingWord || !userId) return;

    const { error } = await supabase
      .from(selectedTable)
      .update({
        word_en: editingWord.word_en,
        word_kr: editingWord.word_kr,
        comment: editingWord.comment || null,
        category: editingWord.category || null,
      })
      .eq('id', editingWord.id)
      .eq('user_id', userId);

    if (error) {
      alert('수정 중 오류가 발생했습니다.');
      return;
    }

    setWords(ws =>
      ws.map(w =>
        w.id === editingWord.id
          ? {
              ...w,
              word_en: editingWord.word_en,
              word_kr: editingWord.word_kr,
              comment: editingWord.comment,
              category: editingWord.category,
            }
          : w,
      ),
    );
    setEditingWord(null);
  };

  const handleCancelEdit = () => {
    setEditingWord(null);
  };

  const addKoreanMeaning = () => {
    if (!editingWord) return;
    setEditingWord({
      ...editingWord,
      word_kr: [...editingWord.word_kr, ''],
    });
  };

  const removeKoreanMeaning = (index: number) => {
    if (!editingWord || editingWord.word_kr.length <= 1) return;
    setEditingWord({
      ...editingWord,
      word_kr: editingWord.word_kr.filter((_, i) => i !== index),
    });
  };

  const updateKoreanMeaning = (index: number, value: string) => {
    if (!editingWord) return;
    setEditingWord({
      ...editingWord,
      word_kr: editingWord.word_kr.map((meaning, i) =>
        i === index ? value : meaning,
      ),
    });
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
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>
          내가 등록한 단어
        </h2>
        <span className='text-sm text-gray-500'>총 {count}개</span>
      </div>

      {/* Category Filter */}
      <div className='mb-4 flex gap-2'>
        <button
          className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            selectedTable === 'dontknow_word'
              ? 'border-primary bg-primary text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setSelectedTable('dontknow_word')}
        >
          모르는 단어
        </button>
        <button
          className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            selectedTable === 'major_word'
              ? 'border-primary bg-primary text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setSelectedTable('major_word')}
        >
          전문 용어
        </button>
      </div>

      {words.length === 0 ? (
        <div className='py-4 text-center text-sm text-gray-500'>
          등록된 단어가 없습니다.
        </div>
      ) : (
        <ul className='space-y-3'>
          {words.map(w => (
            <li key={w.id} className='rounded-md border border-gray-200 p-3'>
              {editingWord?.id === w.id ? (
                // Edit Mode
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs text-gray-400'>
                      {new Date(w.created_at).toLocaleString()}
                    </span>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={handleSaveEdit}
                        className='rounded-md bg-green-500 px-3 py-1 text-white hover:bg-green-600'
                      >
                        <Check className='h-4 w-4' />
                      </button>
                      <button
                        type='button'
                        onClick={handleCancelEdit}
                        className='rounded-md bg-gray-500 px-3 py-1 text-white hover:bg-gray-600'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>
                      영어 단어
                    </label>
                    <input
                      type='text'
                      value={editingWord.word_en}
                      onChange={e =>
                        setEditingWord({
                          ...editingWord,
                          word_en: e.target.value,
                        })
                      }
                      className='focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
                    />
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>
                      한국어 뜻
                    </label>
                    {editingWord.word_kr.map((meaning, index) => (
                      <div key={index} className='mb-2 flex gap-2'>
                        <input
                          type='text'
                          value={meaning}
                          onChange={e =>
                            updateKoreanMeaning(index, e.target.value)
                          }
                          className='focus:border-primary focus:ring-primary flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
                          placeholder={`뜻 ${index + 1}`}
                        />
                        {editingWord.word_kr.length > 1 && (
                          <button
                            type='button'
                            onClick={() => removeKoreanMeaning(index)}
                            className='rounded-md bg-red-500 px-2 py-1 text-white hover:bg-red-600'
                          >
                            <X className='h-4 w-4' />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type='button'
                      onClick={addKoreanMeaning}
                      className='text-primary text-sm hover:underline'
                    >
                      + 뜻 추가
                    </button>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>
                      카테고리
                    </label>
                    <input
                      type='text'
                      value={editingWord.category}
                      onChange={e =>
                        setEditingWord({
                          ...editingWord,
                          category: e.target.value,
                        })
                      }
                      className='focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
                      placeholder='카테고리 (선택사항)'
                    />
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-700'>
                      코멘트
                    </label>
                    <textarea
                      value={editingWord.comment}
                      onChange={e =>
                        setEditingWord({
                          ...editingWord,
                          comment: e.target.value,
                        })
                      }
                      className='focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
                      rows={2}
                      placeholder='기억하기 쉬운 팁이나 코멘트 (선택사항)'
                    />
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className='mb-1 text-xs text-gray-400'>
                    {new Date(w.created_at).toLocaleString()}
                  </div>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex-1'>
                      <div className='text-base font-semibold text-gray-900'>
                        {w.word_en}
                      </div>
                      <div className='text-sm text-gray-700'>
                        {Array.isArray(w.word_kr)
                          ? w.word_kr.join(', ')
                          : String(w.word_kr)}
                      </div>
                      {w.category && (
                        <div className='mt-1 text-xs text-blue-600'>
                          📂 {w.category}
                        </div>
                      )}
                      {w.comment && (
                        <div className='mt-1 text-xs text-gray-500'>
                          💬 {w.comment}
                        </div>
                      )}
                    </div>
                    <div className='flex shrink-0 items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => handleEdit(w)}
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
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
