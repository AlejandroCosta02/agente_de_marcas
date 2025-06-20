require('dotenv').config();
const { createClient } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    console.log('Resetting password for testing...');
    
    const client = createClient({
      connectionString: process.env.POSTGRES_URL_NON_POOLING
    });
    
    await client.connect();
    
    // Reset password for usuario@gmail.com
    const email = 'usuario@gmail.com';
    const newPassword = 'test123';
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING email, name',
      [hashedPassword, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found:', email);
      return;
    }

    const user = result.rows[0];
    console.log('✅ Password reset successfully!');
    console.log('User:', user.email);
    console.log('Name:', user.name);
    console.log('New password:', newPassword);
    console.log('');
    console.log('You can now login with:');
    console.log('Email:', email);
    console.log('Password:', newPassword);
    
    await client.end();
  } catch (error) {
    console.error('❌ Password reset failed:', error);
  }
}

resetPassword(); 