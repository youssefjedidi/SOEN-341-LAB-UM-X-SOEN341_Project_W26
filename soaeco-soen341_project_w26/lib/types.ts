export interface Recipe {
  id: string;
  title: string;
  prep_time: number;
  ingredients: string[];
  cost: number;
  preparation_steps: string;
  difficulty: number;
  user_id: string;
  created_at?: string;
}
