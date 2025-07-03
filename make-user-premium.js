const { createPool } = require('@vercel/postgres');

async function makeUserPremium(userEmail, tier = 'master') {
  const pool = createPool();
  
  try {
    console.log(`🔍 Looking for user: ${userEmail}`);
    
    // Find the user
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found!');
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log(`✅ User found with ID: ${userId}`);
    
    // Check if user already has a subscription
    const existingSub = await pool.query('SELECT * FROM "UserSubscription" WHERE "userId" = $1', [userId]);
    
    if (existingSub.rows.length > 0) {
      console.log('⚠️ User already has a subscription. Updating...');
      await pool.query(`
        UPDATE "UserSubscription" 
        SET tier = $1, "startDate" = $2, "endDate" = $3, status = $4
        WHERE "userId" = $5
      `, [
        tier,
        new Date(),
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        'active',
        userId
      ]);
    } else {
      console.log('✅ Creating new premium subscription...');
      await pool.query(`
        INSERT INTO "UserSubscription" (id, "userId", tier, "startDate", "endDate", status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        `sub_${Date.now()}`,
        userId,
        tier,
        new Date(),
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        'active'
      ]);
    }
    
    console.log(`🎉 Success! ${userEmail} is now ${tier} tier premium!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

// Usage examples:
// makeUserPremium('user@example.com', 'master');     // Master tier
// makeUserPremium('user@example.com', 'pro');        // Pro tier  
// makeUserPremium('user@example.com', 'essential');  // Essential tier

// Uncomment and modify the line below to make a user premium:
// makeUserPremium('user@example.com', 'master');

console.log('📝 To use this script:');
console.log('1. Edit the last line to specify the user email and tier');
console.log('2. Run: node make-user-premium.js');
console.log('');
console.log('Available tiers: essential, pro, master'); 