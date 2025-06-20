-- Create marca_files table
CREATE TABLE IF NOT EXISTS marca_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marca_id UUID NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  s3_url TEXT NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_marca_files_marca_id ON marca_files(marca_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marca_files_updated_at 
    BEFORE UPDATE ON marca_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 