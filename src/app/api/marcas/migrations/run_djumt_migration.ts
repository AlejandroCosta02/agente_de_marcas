import { createPool } from '@vercel/postgres';

export async function runDjumtMigration() {
  try {
    const pool = createPool();
    
    // Add DJUMT column if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marcas' AND column_name='djumt') THEN
          ALTER TABLE marcas ADD COLUMN djumt DATE DEFAULT CURRENT_DATE;
        END IF;
      END $$;
    `);
    
    console.log('✅ DJUMT migration completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error running DJUMT migration:', error);
    return false;
  }
} 