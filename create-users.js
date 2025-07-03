const { createPool } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function createUsers() {
  const pool = createPool();
  
  try {
    // Create your account (FREE)
    const hashedPassword = await bcrypt.hash('Nami1992', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password, welcome_seen, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `, ['Costa Alejandro', 'costa.claudio.alejandro@gmail.com', hashedPassword, true]);
    
    console.log('✅ Your account created successfully (FREE tier)');
    
    // Create the other premium user
    const otherHashedPassword = await bcrypt.hash('AzulAmor32', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password, welcome_seen, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `, ['Luciana Dinoto', 'lucianadinoto@gmail.com', otherHashedPassword, true]);
    
    console.log('✅ Other user account created successfully');
    
    // Get other user ID
    const otherUserResult = await pool.query('SELECT id FROM users WHERE email = $1', ['lucianadinoto@gmail.com']);
    const otherUserId = otherUserResult.rows[0].id;
    
    // Create premium subscription for other user only
    await pool.query(`
      INSERT INTO "UserSubscription" (id, "userId", tier, "startDate", "endDate", status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      `sub_other_${Date.now()}`,
      otherUserId,
      'master', // Premium tier
      new Date(),
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      'active'
    ]);
    
    console.log('✅ Premium subscription created for Luciana Dinoto');
    
    console.log('\n🎉 All users recreated successfully!');
    console.log('\n- Costa Alejandro: FREE tier (for testing new features)');
    console.log('- Luciana Dinoto: Master tier (premium)');
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await pool.end();
  }
}

createUsers(); 