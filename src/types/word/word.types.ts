export interface WordData {
  id: string;
  word_en: string;
  word_kr: string[];
  created_at: string;
  category: string;
  comment: string;
  user_id: string;
  is_checked: boolean;
  major_name?: string;
}

export interface CreateWordData {
  word_en: string;
  word_kr: string[];
  category?: string;
  comment?: string;
  created_at?: string;
  user_id: string;
  major_name?: string;
}

export interface UpdateWordData {
  word_en?: string;
  word_kr?: string[];
  category?: string;
  comment?: string;
  created_at?: string;
  user_id?: string;
  is_checked?: boolean;
  major_name?: string;
}
