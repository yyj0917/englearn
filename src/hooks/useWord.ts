// src/hooks/useSupabaseTodos.ts
import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  type CreateDontknowWordData,
  type DontknowWord,
} from '../types/word/word.types';

export const useDontknowWords = (userId?: string) => {
  const [dontknowWords, setDontknowWords] = useState<DontknowWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 실시간 구독을 위한 채널
  useEffect(() => {
    if (!userId) {
      setDontknowWords([]);
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel;

    const fetchDontknowWords = async () => {
      try {
        const { data, error } = await supabase
          .from('dontknow_word')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setDontknowWords(data || []);
        setError(null);
      } catch (error: any) {
        console.error('Todo 조회 에러:', error);
        setError('할일 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    // 초기 데이터 로드
    fetchDontknowWords();

    // 실시간 구독 설정
    channel = supabase
      .channel(`dontknow_word:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dontknow_word',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          console.log('실시간 변경:', payload);

          if (payload.eventType === 'INSERT') {
            setDontknowWords(prev => [payload.new as DontknowWord, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDontknowWords(prev =>
              prev.map(dontknowWord =>
                dontknowWord.id === payload.new.id
                  ? (payload.new as DontknowWord)
                  : dontknowWord,
              ),
            );
          } else if (payload.eventType === 'DELETE') {
            setDontknowWords(prev =>
              prev.filter(dontknowWord => dontknowWord.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  // Todo 추가
  const addDontknowWord = async (dontknowWordData: CreateDontknowWordData) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('dontknow_word')
        .insert([
          {
            word_en: dontknowWordData.word_en.trim(),
            word_kr: Array.isArray(dontknowWordData.word_kr)
              ? dontknowWordData.word_kr.join(' ').trim()
              : dontknowWordData.word_kr,
            category: dontknowWordData.category?.trim(),
            comment: dontknowWordData.comment?.trim(),
            user_id: userId,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      // 실시간 구독으로 자동 업데이트되므로 수동 업데이트 불필요
    } catch (error: any) {
      console.error('DontknowWord 추가 에러:', error);
      setError('할일 추가에 실패했습니다.');
    }
  };

  // Todo 완료 상태 토글
  // const toggleDontknowWord = async (dontknowWordId: string, completed: boolean) => {
  //   try {
  //     const { error } = await supabase
  //       .from('dontknow_word')
  //       .update({
  //         completed: !completed,
  //         updated_at: new Date().toISOString()
  //       })
  //       .eq('id', dontknowWordId)

  //     if (error) throw error
  //   } catch (error: any) {
  //     console.error('DontknowWord 수정 에러:', error)
  //     setError('할일 수정에 실패했습니다.')
  //   }
  // }

  // // Todo 텍스트 수정
  // const updateDontknowWordText = async (dontknowWordId: string, newText: string) => {
  //   try {
  //     const { error } = await supabase
  //       .from('dontknow_word')
  //       .update({
  //         text: newText.trim(),
  //         updated_at: new Date().toISOString()
  //       })
  //       .eq('id', dontknowWordId)

  //     if (error) throw error
  //   } catch (error: any) {
  //     console.error('DontknowWord 텍스트 수정 에러:', error)
  //     setError('할일 수정에 실패했습니다.')
  //   }
  // }

  // Todo 삭제
  const deleteDontknowWord = async (dontknowWordId: string) => {
    try {
      const { error } = await supabase
        .from('dontknow_word')
        .delete()
        .eq('id', dontknowWordId);

      if (error) throw error;
    } catch (error: any) {
      console.error('DontknowWord 삭제 에러:', error);
      setError('할일 삭제에 실패했습니다.');
    }
  };

  // 완료된 Todo 일괄 삭제
  const deleteCompletedDontknowWords = async () => {
    try {
      const { error } = await supabase
        .from('dontknow_word')
        .delete()
        .eq('user_id', userId)
        .eq('completed', true);

      if (error) throw error;
    } catch (error: any) {
      console.error('완료된 DontknowWord 삭제 에러:', error);
      setError('완료된 할일 삭제에 실패했습니다.');
    }
  };

  return {
    dontknowWords,
    loading,
    error,
    addDontknowWord,
    // toggleDontknowWord,
    // updateDontknowWordText,
    deleteDontknowWord,
    deleteCompletedDontknowWords,
  };
};
