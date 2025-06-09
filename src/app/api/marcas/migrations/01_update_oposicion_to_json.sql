-- First, create a temporary table to store the existing data
CREATE TEMP TABLE temp_marcas AS 
SELECT id, oposicion FROM marcas;

-- Convert oposicion column to JSONB
ALTER TABLE marcas 
ALTER COLUMN oposicion TYPE JSONB[] 
USING ARRAY(
  SELECT json_build_object(
    'text', COALESCE(value, ''),
    'completed', false
  )::jsonb
  FROM unnest(oposicion) AS value
); 