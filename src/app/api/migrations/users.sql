-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  address VARCHAR(255),
  contact_email VARCHAR(255),
  contact_number VARCHAR(50),
  agent_number VARCHAR(50),
  province VARCHAR(100),
  zip_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add columns if they do not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
    ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='address') THEN
    ALTER TABLE users ADD COLUMN address VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='contact_email') THEN
    ALTER TABLE users ADD COLUMN contact_email VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='contact_number') THEN
    ALTER TABLE users ADD COLUMN contact_number VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='agent_number') THEN
    ALTER TABLE users ADD COLUMN agent_number VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='province') THEN
    ALTER TABLE users ADD COLUMN province VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='zip_code') THEN
    ALTER TABLE users ADD COLUMN zip_code VARCHAR(20);
  END IF;
END $$; 