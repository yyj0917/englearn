import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 필요합니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 타입 정의
export interface Database {
  public: {
    Tables: {
      dontknow_word: {
        Row: {
          id: string;
          word_en: string;
          word_kr: JSON;
          created_at: string;
          category: string;
          comment: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          word_en: string;
          word_kr: JSON;
          created_at?: string;
          category?: string;
          comment?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          word_en?: string;
          word_kr?: JSON;
          category?: string;
          comment?: string;
          created_at?: string;
          user_id?: string;
        };
      };
    };
  };
}
