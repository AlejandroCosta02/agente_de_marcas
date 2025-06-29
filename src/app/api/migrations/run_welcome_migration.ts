import { createPool } from '@vercel/postgres';

export async function runWelcomeMigration() {
  try {
    const pool = createPool();
    
    // Add welcome_seen column if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='welcome_seen') THEN
          ALTER TABLE users ADD COLUMN welcome_seen BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `);
    
    console.log('✅ Welcome migration completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error running welcome migration:', error);
    return false;
  }
} 