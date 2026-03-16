export interface Ingredient {
  name: string;
  calories: number;
}

export interface Recipe {
  id: string;
  title: string;
  prep_time: number;
  tags?: string[];
  ingredients: Ingredient[];
  restrictions: string[];
  cost: number;
  preparation_steps: string;
  difficulty: number;
  user_id: string;
  created_at?: string;
}
