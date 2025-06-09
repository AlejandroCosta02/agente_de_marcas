-- Add tipo_marca column
ALTER TABLE marcas ADD COLUMN IF NOT EXISTS tipo_marca VARCHAR(255) DEFAULT 'denominativa';

-- Add clases column
ALTER TABLE marcas ADD COLUMN IF NOT EXISTS clases INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- Update oposicion column to use JSONB instead of TEXT[]
ALTER TABLE marcas 
  ALTER COLUMN oposicion TYPE JSONB USING CASE 
    WHEN oposicion IS NULL THEN '[]'::jsonb
    WHEN oposicion = ARRAY[]::TEXT[] THEN '[]'::jsonb
    ELSE json_build_array(json_build_object('text', oposicion[1], 'completed', false))::jsonb
  END; 