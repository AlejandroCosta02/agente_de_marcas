import { createPool } from '@vercel/postgres';

export async function runMarcaLengthMigration() {
  try {
    const pool = createPool();
    
    // Update marca column length from 20 to 60 characters
    await pool.query(`
      ALTER TABLE marcas ALTER COLUMN marca TYPE VARCHAR(60);
    `);
    
    console.log('✅ Marca length migration completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error running marca length migration:', error);
    return false;
  }
} 