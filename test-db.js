require('dotenv').config();
const { createClient } = require('@vercel/postgres');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    const client = createClient({
      connectionString: process.env.POSTGRES_URL_NON_POOLING
    });
    
    await client.connect();
    console.log('✅ Database connected successfully');
    
    // Check if users table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    console.log('Users table exists:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Check users count
      const usersCount = await client.query('SELECT COUNT(*) FROM users');
      console.log('Number of users in database:', usersCount.rows[0].count);
      
      // List all users (without passwords)
      const users = await client.query('SELECT id, email, name, created_at FROM users');
      console.log('Users in database:');
      users.rows.forEach(user => {
        console.log(`- ${user.email} (${user.name}) - Created: ${user.created_at}`);
      });
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase(); 