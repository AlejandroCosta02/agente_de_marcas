import { sql } from '@vercel/postgres';

export async function runMigrations() {
  try {
    // Add tipo_marca column
    await sql`ALTER TABLE marcas ADD COLUMN IF NOT EXISTS tipo_marca VARCHAR(255) DEFAULT 'denominativa';`;
    console.log('Added tipo_marca column');

    // Add clases column
    await sql`ALTER TABLE marcas ADD COLUMN IF NOT EXISTS clases INTEGER[] DEFAULT ARRAY[]::INTEGER[];`;
    console.log('Added clases column');

    // Update oposicion column to use JSONB
    await sql`
      ALTER TABLE marcas 
      ALTER COLUMN oposicion TYPE JSONB USING CASE 
        WHEN oposicion IS NULL THEN '[]'::jsonb
        WHEN oposicion = ARRAY[]::TEXT[] THEN '[]'::jsonb
        ELSE json_build_array(json_build_object('text', oposicion[1], 'completed', false))::jsonb
      END;
    `;
    console.log('Updated oposicion column to JSONB');

    return { success: true, message: 'Migrations completed successfully' };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
} 