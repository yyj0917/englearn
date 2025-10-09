import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';
import { type CreateWordData } from '../../types/word/word.types';

interface MajorCategory {
  id: string;
  major_name: string;
  created_at: string;
}

interface WordFormProps {
  onSubmit: (
    data: Omit<CreateWordData, 'user_id'> & {
      major_category_id?: string;
    },
  ) => void;
  isLoading?: boolean;
  category?: string; // optional initial category (table key)
}

export function WordForm({
  onSubmit,
  isLoading = false,
  category = 'dontknow_word',
}: WordFormProps) {
  const userId = useAuthStore(s => s.userId);
  const [majorCategories, setMajorCategories] = useState<MajorCategory[]>([]);
  const [selectedMajorCategory, setSelectedMajorCategory] = useState<
    string | null
  >(null);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [formData, setFormData] = useState({
    word_en: '',
    word_kr: '', // comma-separated input; parsed to string[] on submit
    comment: '',
    category,
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  // Load major categories when component mounts
  useEffect(() => {
    const fetchMajorCategories = async () => {
      if (!userId) return;
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from('major_category')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch major categories:', error);
      } else {
        setMajorCategories((data as unknown as MajorCategory[]) ?? []);
      }
      setLoadingCategories(false);
    };

    fetchMajorCategories();
  }, [userId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // 에러 메시지 제거
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

    if (!formData.word_en.trim()) {
      newErrors.word_en = '영어 단어를 입력해주세요';
    }

    if (!formData.word_kr.trim()) {
      newErrors.word_kr = '한글 뜻을 입력해주세요';
    } else {
      const meanings = formData.word_kr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (meanings.length === 0) {
        newErrors.word_kr = '최소 1개의 뜻을 입력해주세요';
      }
    }

    // Validate major category selection for major words
    if (formData.category === 'major_word' && !selectedMajorCategory) {
      newErrors.category = '전공과목을 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const wordData: Omit<CreateWordData, 'user_id'> & {
      major_name?: string;
    } = {
      word_en: formData.word_en.trim(),
      word_kr: formData.word_kr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      category: formData.category,
      comment: formData.comment.trim() || undefined,
    };
    if (formData.category === 'major_word') {
      wordData.major_name = selectedMajorCategory || undefined;
    }

    onSubmit(wordData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      word_en: '',
      word_kr: '',
      comment: '',
      category,
    });
    setSelectedMajorCategory(null);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className='mx-auto w-full max-w-md space-y-6'>
      <div className='space-y-4'>
        {/* 영어 단어 입력 */}
        <div>
          <label
            htmlFor='word_en'
            className='mb-2 block text-sm font-medium text-gray-700'
          >
            영어 단어 *
          </label>
          <input
            type='text'
            id='word_en'
            name='word_en'
            value={formData.word_en}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 ${
              errors.word_en ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='ex) comprise'
          />
          {errors.word_en && (
            <p className='mt-1 text-sm text-red-600'>{errors.word_en}</p>
          )}
        </div>

        {/* 한글 뜻 입력 */}
        <div>
          <label
            htmlFor='word_kr'
            className='mb-2 block text-sm font-medium text-gray-700'
          >
            한글 뜻 (쉼표로 구분) *
          </label>
          <input
            type='text'
            id='word_kr'
            name='word_kr'
            value={formData.word_kr}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 ${
              errors.word_kr ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='ex) 이루다, 포함하다'
          />
          {errors.word_kr && (
            <p className='mt-1 text-sm text-red-600'>{errors.word_kr}</p>
          )}
          {!errors.word_kr && (
            <p className='mt-1 text-xs text-gray-500'>
              여러 뜻은 쉼표(,)로 구분해서 입력하세요.
            </p>
          )}
        </div>

        {/* 카테고리 선택 (테이블 분류) */}
        <div>
          <label
            htmlFor='category'
            className='mb-2 block text-sm font-medium text-gray-700'
          >
            카테고리
          </label>
          <div className='grid grid-cols-2 gap-3'>
            <button
              type='button'
              onClick={() => {
                setFormData(prev => ({ ...prev, category: 'dontknow_word' }));
                setSelectedMajorCategory(null);
              }}
              disabled={isLoading}
              className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                formData.category === 'dontknow_word'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              모르는 단어
            </button>
            <button
              type='button'
              onClick={() => {
                setFormData(prev => ({ ...prev, category: 'major_word' }));
                setSelectedMajorCategory(null);
              }}
              className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 ${
                formData.category === 'major_word'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              전공 용어
            </button>
          </div>
          {errors.category && (
            <p className='mt-1 text-sm text-red-600'>{errors.category}</p>
          )}
        </div>

        {/* 전공과목 선택 (전공 용어 선택 시에만 표시) */}
        {formData.category === 'major_word' && (
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              전공과목 선택 *
            </label>
            {loadingCategories ? (
              <div className='flex items-center justify-center py-4 text-sm text-gray-500'>
                전공과목을 불러오는 중...
              </div>
            ) : majorCategories.length === 0 ? (
              <div className='rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800'>
                등록된 전공과목이 없습니다. 마이페이지에서 전공과목을 먼저
                등록해주세요.
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-2'>
                {majorCategories.map(category => (
                  <button
                    key={category.id}
                    type='button'
                    onClick={() =>
                      setSelectedMajorCategory(category.major_name)
                    }
                    disabled={isLoading}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 ${
                      selectedMajorCategory === category.major_name
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category.major_name}
                  </button>
                ))}
                <button
                  type='button'
                  onClick={() => setSelectedMajorCategory(null)}
                  disabled={isLoading}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    selectedMajorCategory === null
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`text-gray-700 ${
                      selectedMajorCategory === null
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    없음
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 카테고리 입력 제거: 테이블 선택은 상위 컴포넌트에서 처리 */}

        {/* 코멘트 입력 */}
        <div>
          <label
            htmlFor='comment'
            className='mb-2 block text-sm font-medium text-gray-700'
          >
            코멘트
          </label>
          <textarea
            id='comment'
            name='comment'
            value={formData.comment}
            onChange={handleInputChange}
            disabled={isLoading}
            rows={3}
            className='w-full resize-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100'
            placeholder='ex) 문장에서 사용법, 기억 팁 등'
          />
        </div>
      </div>

      {/* 버튼들 */}
      <div className='flex space-x-3'>
        <button
          type='button'
          onClick={handleReset}
          disabled={isLoading}
          className='flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100'
        >
          초기화
        </button>
        <button
          type='submit'
          disabled={isLoading}
          className='flex-1 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-blue-400'
        >
          {isLoading ? '업로드 중...' : '단어 추가'}
        </button>
      </div>
    </form>
  );
}
