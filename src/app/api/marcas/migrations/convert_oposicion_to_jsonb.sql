-- Add a temporary JSONB column
ALTER TABLE marcas ADD COLUMN oposicion_jsonb JSONB DEFAULT '[]';

-- Update the temporary column with converted data
UPDATE marcas
SET oposicion_jsonb = COALESCE(
  (
    SELECT json_agg(json_build_object('text', x, 'completed', false))::jsonb
    FROM (
      SELECT unnest(string_to_array(trim(both '{}' from oposicion::text), ',')) AS x
      WHERE oposicion IS NOT NULL AND oposicion::text != '{}'
    ) subq
  ),
  '[]'::jsonb
);

-- Drop the old column
ALTER TABLE marcas DROP COLUMN oposicion;

-- Rename the new column
ALTER TABLE marcas RENAME COLUMN oposicion_jsonb TO oposicion; 