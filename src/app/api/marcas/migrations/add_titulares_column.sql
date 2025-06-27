-- Add titulares column to marcas table
-- This column will store multiple titulares as JSONB
ALTER TABLE marcas ADD COLUMN IF NOT EXISTS titulares JSONB DEFAULT '[]'::jsonb;

-- Update existing records to have at least one titular in the titulares array
-- based on the existing titular_nombre, titular_email, and titular_telefono fields
UPDATE marcas 
SET titulares = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'fullName', COALESCE(titular_nombre, ''),
    'email', COALESCE(titular_email, ''),
    'phone', COALESCE(titular_telefono, '')
  )
)
WHERE titulares IS NULL OR titulares = '[]'::jsonb; 