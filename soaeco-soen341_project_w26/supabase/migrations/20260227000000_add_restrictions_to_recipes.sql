-- Add restrictions column to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS restrictions TEXT[] DEFAULT '{}';
