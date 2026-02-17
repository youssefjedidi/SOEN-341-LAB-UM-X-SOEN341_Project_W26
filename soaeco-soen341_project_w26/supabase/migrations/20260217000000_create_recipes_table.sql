CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  prep_time INTEGER NOT NULL,
  ingredients TEXT[] NOT NULL,
  cost INTEGER NOT NULL,
  preparation_steps TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
-- Policy: Users can only see/edit their own recipes
CREATE POLICY "Users can manage their own recipes"
ON recipes FOR ALL
USING (auth.uid() = user_id);
