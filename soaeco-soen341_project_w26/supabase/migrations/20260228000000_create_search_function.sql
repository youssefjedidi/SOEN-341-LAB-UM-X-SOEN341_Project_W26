CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a function that searches for recipes by searching both title and ingredients
-- and returns a matched set of recipes using pg_trgm for fuzzy typo matching.

CREATE OR REPLACE FUNCTION search_recipes(search_term TEXT)
RETURNS SETOF recipes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If search term is very short, fallback to ILIKE to avoid weird pg_trgm threshold issues on 1-2 letters
  IF length(search_term) < 3 THEN
    RETURN QUERY
    SELECT *
    FROM recipes
    WHERE 
      title ILIKE '%' || search_term || '%'
      OR 
      array_to_string(ingredients, ' ') ILIKE '%' || search_term || '%';
  ELSE
    -- Use pg_trgm % operator for true fuzzy matching on typos
    RETURN QUERY
    SELECT *
    FROM recipes
    WHERE 
      title % search_term
      OR 
      array_to_string(ingredients, ' ') % search_term
      OR
      -- Also keep ILIKE around just in case the similarity strictly fails but it's a direct substring
      title ILIKE '%' || search_term || '%'
      OR 
      array_to_string(ingredients, ' ') ILIKE '%' || search_term || '%';
  END IF;
END;
$$;
