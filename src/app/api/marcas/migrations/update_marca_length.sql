-- Update marca column to allow longer names
ALTER TABLE marcas
ALTER COLUMN marca TYPE VARCHAR(255); 