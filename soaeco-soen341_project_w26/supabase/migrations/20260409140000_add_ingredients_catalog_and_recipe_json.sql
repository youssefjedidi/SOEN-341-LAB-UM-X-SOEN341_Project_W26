CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  calories_per_100g NUMERIC(10, 2) NOT NULL CHECK (calories_per_100g >= 0),
  source TEXT NOT NULL DEFAULT 'CNF 2015',
  source_food_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT ingredients_source_food_id_unique UNIQUE (source, source_food_id)
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view ingredients" ON ingredients;
CREATE POLICY "Anyone can view ingredients"
ON ingredients FOR SELECT
USING (true);

CREATE INDEX IF NOT EXISTS ingredients_name_trgm_idx
ON ingredients
USING GIN (name gin_trgm_ops);

DO $$
DECLARE
  ingredients_data_type TEXT;
  ingredients_udt_name TEXT;
BEGIN
  SELECT data_type, udt_name
  INTO ingredients_data_type, ingredients_udt_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'recipes'
    AND column_name = 'ingredients';

  IF ingredients_data_type = 'ARRAY' AND ingredients_udt_name = '_text' THEN
    ALTER TABLE recipes
      ADD COLUMN IF NOT EXISTS ingredients_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb;

    UPDATE recipes
    SET ingredients_jsonb = COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'ingredient_id', NULL,
            'name', ingredient_name,
            'grams', NULL,
            'calories_per_100g', NULL,
            'calories', 0
          )
        )
        FROM unnest(ingredients) AS ingredient_name
      ),
      '[]'::jsonb
    );

    ALTER TABLE recipes DROP COLUMN ingredients;
    ALTER TABLE recipes RENAME COLUMN ingredients_jsonb TO ingredients;
  ELSIF ingredients_data_type = 'json' THEN
    ALTER TABLE recipes
      ALTER COLUMN ingredients TYPE JSONB
      USING ingredients::jsonb;
  END IF;

  ALTER TABLE recipes
    ALTER COLUMN ingredients SET DEFAULT '[]'::jsonb;

  UPDATE recipes
  SET ingredients = '[]'::jsonb
  WHERE ingredients IS NULL;

  ALTER TABLE recipes
    ALTER COLUMN ingredients SET NOT NULL;
END $$;

CREATE OR REPLACE FUNCTION recipe_ingredient_names(ingredients_json JSONB)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT COALESCE(
    string_agg(
      CASE
        WHEN jsonb_typeof(value) = 'object' THEN COALESCE(value->>'name', '')
        WHEN jsonb_typeof(value) = 'string' THEN trim(both '"' from value::text)
        ELSE ''
      END,
      ' '
    ),
    ''
  )
  FROM jsonb_array_elements(COALESCE(ingredients_json, '[]'::jsonb)) AS value;
$$;

CREATE OR REPLACE FUNCTION search_recipes(search_term TEXT)
RETURNS SETOF recipes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF length(search_term) < 3 THEN
    RETURN QUERY
    SELECT *
    FROM recipes
    WHERE
      title ILIKE '%' || search_term || '%'
      OR recipe_ingredient_names(ingredients) ILIKE '%' || search_term || '%';
  ELSE
    RETURN QUERY
    SELECT *
    FROM recipes
    WHERE
      title % search_term
      OR recipe_ingredient_names(ingredients) % search_term
      OR title ILIKE '%' || search_term || '%'
      OR recipe_ingredient_names(ingredients) ILIKE '%' || search_term || '%';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION search_ingredients(search_term TEXT, result_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  name TEXT,
  calories_per_100g NUMERIC,
  source TEXT,
  source_food_id INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    ingredients.id,
    ingredients.name,
    ingredients.calories_per_100g,
    ingredients.source,
    ingredients.source_food_id
  FROM ingredients
  WHERE
    search_term IS NOT NULL
    AND btrim(search_term) <> ''
    AND (
      ingredients.name % search_term
      OR ingredients.name ILIKE '%' || search_term || '%'
    )
  ORDER BY
    CASE
      WHEN lower(ingredients.name) = lower(search_term) THEN 0
      WHEN ingredients.name ILIKE search_term || '%' THEN 1
      WHEN ingredients.name ILIKE '%' || search_term || '%' THEN 2
      ELSE 3
    END,
    similarity(ingredients.name, search_term) DESC,
    ingredients.name ASC
  LIMIT GREATEST(COALESCE(result_limit, 20), 1);
$$;
