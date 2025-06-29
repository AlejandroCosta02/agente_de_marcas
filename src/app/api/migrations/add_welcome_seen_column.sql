-- Add welcome_seen column to users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='welcome_seen') THEN
    ALTER TABLE users ADD COLUMN welcome_seen BOOLEAN DEFAULT FALSE;
  END IF;
END $$; 