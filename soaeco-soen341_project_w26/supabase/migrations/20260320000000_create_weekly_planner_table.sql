CREATE TABLE IF NOT EXISTS weekly_planner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL CHECK (
    day_of_week IN (
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    )
  ),
  meal_type TEXT NOT NULL CHECK (
    meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')
  ),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_of_week, meal_type)
);

ALTER TABLE weekly_planner ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own weekly planner" ON weekly_planner;
DROP POLICY IF EXISTS "Users can insert own weekly planner" ON weekly_planner;
DROP POLICY IF EXISTS "Users can update own weekly planner" ON weekly_planner;
DROP POLICY IF EXISTS "Users can delete own weekly planner" ON weekly_planner;

CREATE POLICY "Users can view own weekly planner"
  ON weekly_planner
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly planner"
  ON weekly_planner
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly planner"
  ON weekly_planner
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly planner"
  ON weekly_planner
  FOR DELETE
  USING (auth.uid() = user_id);
