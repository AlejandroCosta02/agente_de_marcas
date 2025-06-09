import { neon } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const sql = neon(process.env.DIRECT_URL!);

async function main() {
  console.log('Running migrations...');
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "Titular" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "nombre" TEXT NOT NULL,
        "direccion" TEXT NOT NULL,
        "email" TEXT,
        "phone" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Marca" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "nombre" TEXT NOT NULL,
        "acta" TEXT NOT NULL,
        "clase" TEXT NOT NULL,
        "estado" TEXT NOT NULL,
        "renovar" TIMESTAMP NOT NULL,
        "vencimiento" TIMESTAMP NOT NULL,
        "anotaciones" TEXT[] DEFAULT '{}',
        "oposicion" TEXT[] DEFAULT '{}',
        "user_email" TEXT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "titularId" TEXT NOT NULL REFERENCES "Titular"("id")
      );

      CREATE INDEX IF NOT EXISTS "marca_user_email_idx" ON "Marca"("user_email");
    `;
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 