-- Add DJUMT column to marcas table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marcas' AND column_name='djumt') THEN
    ALTER TABLE marcas ADD COLUMN djumt DATE DEFAULT CURRENT_DATE;
  END IF;
END $$; 