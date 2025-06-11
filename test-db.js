const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@vercel/postgres');

async function testConnection() {
  console.log('Testing database connection...');
  
  // Test Prisma connection
  try {
    const prisma = new PrismaClient();
    console.log('Attempting Prisma connection...');
    await prisma.$connect();
    console.log('✅ Prisma connection successful');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
  }

  // Test Vercel Postgres connection
  try {
    const client = createClient();
    console.log('Attempting Vercel Postgres connection...');
    await client.connect();
    await client.query('SELECT NOW()');
    console.log('✅ Vercel Postgres connection successful');
    await client.end();
  } catch (error) {
    console.error('❌ Vercel Postgres connection failed:', error);
  }
}

testConnection().catch(console.error); 