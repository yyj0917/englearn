export interface DontknowWord {
  id: string;
  word_en: string;
  word_kr: string[];
  created_at: string;
  category: string;
  comment: string;
  user_id: string;
}

export interface CreateDontknowWordData {
  word_en: string;
  word_kr: string[];
  category?: string;
  comment?: string;
  created_at?: string;
  user_id: string;
}

export interface UpdateDontknowWordData {
  word_en?: string;
  word_kr?: string[];
  category?: string;
  comment?: string;
  created_at?: string;
  user_id?: string;
}
