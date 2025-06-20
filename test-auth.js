require('dotenv').config();
const { createClient } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    const client = createClient({
      connectionString: process.env.POSTGRES_URL_NON_POOLING
    });
    
    await client.connect();
    
    // Test with a known user
    const testEmail = 'alejandro@gmail.com';
    const testPassword = 'password123'; // Change this to the actual password
    
    const { rows } = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [testEmail]
    );

    if (rows.length === 0) {
      console.log('❌ User not found:', testEmail);
      return;
    }

    const user = rows[0];
    console.log('✅ User found:', user.email);
    console.log('User ID:', user.id);
    console.log('User name:', user.name);
    console.log('Password hash:', user.password.substring(0, 20) + '...');

    // Test password verification
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
      console.log('❌ Password is incorrect. Try a different password.');
      console.log('Available users:');
      const allUsers = await client.query('SELECT email, name FROM users');
      allUsers.rows.forEach(u => console.log(`- ${u.email} (${u.name})`));
    } else {
      console.log('✅ Authentication would succeed!');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Auth test failed:', error);
  }
}

testAuth(); 