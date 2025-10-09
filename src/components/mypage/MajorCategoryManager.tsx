import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';

interface MajorCategory {
  id: string;
  major_name: string;
  created_at: string;
}

// Generate a random color for each category
export const getRandomColor = (index: number) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-emerald-500',
    'bg-violet-500',
  ];
  return colors[index % colors.length];
};

interface EditState {
  id: string | null;
  major_name: string;
}

export function MajorCategoryManager() {
  const userId = useAuthStore(s => s.userId);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MajorCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<EditState | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchCategories = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('major_category')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      setError('전공과목을 불러오지 못했습니다.');
    } else {
      setCategories((data as unknown as MajorCategory[]) ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async () => {
    if (!newCategoryName.trim() || !userId) return;

    const { data, error } = await supabase
      .from('major_category')
      .insert([{ major_name: newCategoryName.trim(), user_id: userId }])
      .select();

    if (error) {
      alert('전공과목 추가 중 오류가 발생했습니다.');
      return;
    }

    setCategories(prev => [data[0] as MajorCategory, ...prev]);
    setNewCategoryName('');
    setIsAdding(false);
  };

  const handleEdit = (category: MajorCategory) => {
    setEditingCategory({
      id: category.id,
      major_name: category.major_name,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !userId) return;

    const { error } = await supabase
      .from('major_category')
      .update({ major_name: editingCategory.major_name })
      .eq('id', editingCategory.id)
      .eq('user_id', userId);

    if (error) {
      alert('수정 중 오류가 발생했습니다.');
      return;
    }

    setCategories(prev =>
      prev.map(c =>
        c.id === editingCategory.id
          ? { ...c, major_name: editingCategory.major_name }
          : c,
      ),
    );
    setEditingCategory(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 전공과목을 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('major_category')
      .delete()
      .eq('id', id)
      .eq('user_id', userId!);

    if (error) {
      alert('삭제 중 오류가 발생했습니다.');
      return;
    }

    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewCategoryName('');
  };

  if (!userId) {
    return (
      <div className='text-center text-sm text-gray-500'>
        로그인 후 확인할 수 있습니다.
      </div>
    );
  }

  if (error) {
    return <div className='text-center text-sm text-red-600'>{error}</div>;
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>내 전공과목</h2>
        <button
          type='button'
          onClick={() => setIsAdding(true)}
          className='bg-primary hover:bg-primary/90 flex items-center gap-1 rounded-md px-3 py-2 text-sm text-white'
        >
          <Plus className='h-4 w-4' />
          추가
        </button>
      </div>
      {loading && (
        <div className='flex-center py-6 text-blue-600'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span className='ml-2 text-sm'>불러오는 중...</span>
        </div>
      )}
      {isAdding && (
        <div className='mb-4 rounded-md border border-gray-200 bg-gray-50 p-3'>
          <div className='mb-2'>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              전공과목명
            </label>
            <input
              type='text'
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              className='focus:border-primary focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
              placeholder='예: 컴퓨터공학, 수학, 물리학...'
              autoFocus
            />
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={handleAdd}
              disabled={!newCategoryName.trim()}
              className='flex items-center gap-1 rounded-md bg-green-500 px-3 py-1 text-white hover:bg-green-600 disabled:bg-gray-300'
            >
              <Check className='h-4 w-4' />
              추가
            </button>
            <button
              type='button'
              onClick={handleCancelAdd}
              className='flex items-center gap-1 rounded-md bg-gray-500 px-3 py-1 text-white hover:bg-gray-600'
            >
              <X className='h-4 w-4' />
              취소
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 || error ? (
        <div className='py-4 text-center text-sm text-gray-500'>
          등록된 전공과목이 없습니다.
        </div>
      ) : (
        <div className='space-y-2'>
          {categories.map((category, index) => (
            <div
              key={category.id}
              className='flex items-center justify-between rounded-md border border-gray-200 p-3'
            >
              {editingCategory?.id === category.id ? (
                <div className='flex flex-1 items-center gap-2'>
                  <div
                    className={`h-3 w-3 rounded-full ${getRandomColor(index)}`}
                  ></div>
                  <input
                    type='text'
                    value={editingCategory.major_name}
                    onChange={e =>
                      setEditingCategory({
                        ...editingCategory,
                        major_name: e.target.value,
                      })
                    }
                    className='focus:border-primary focus:ring-primary flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm focus:ring-1 focus:outline-none'
                    autoFocus
                  />
                  <button
                    type='button'
                    onClick={handleSaveEdit}
                    className='rounded-md bg-green-500 p-1 text-white hover:bg-green-600'
                  >
                    <Check className='h-4 w-4' />
                  </button>
                  <button
                    type='button'
                    onClick={handleCancelEdit}
                    className='rounded-md bg-gray-500 p-1 text-white hover:bg-gray-600'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              ) : (
                <>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`h-3 w-3 rounded-full ${getRandomColor(index)}`}
                    ></div>
                    <span className='text-sm font-medium text-gray-900'>
                      {category.major_name}
                    </span>
                  </div>
                  <div className='flex gap-1'>
                    <button
                      type='button'
                      onClick={() => handleEdit(category)}
                      className='rounded-md border border-gray-300 bg-white p-1 text-gray-700 hover:bg-gray-50'
                      aria-label='Edit category'
                    >
                      <Pencil className='h-4 w-4' />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleDelete(category.id)}
                      className='rounded-md border border-red-200 bg-red-50 p-1 text-red-700 hover:bg-red-100'
                      aria-label='Delete category'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
