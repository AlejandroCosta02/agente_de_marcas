const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = 'lucianadinoto@gmail.com';
    
    console.log('🔍 Checking user:', email);
    
    // Check if user exists - using direct SQL since Prisma client has table name issues
    const users = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = users[0];
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    });
    
    // Check subscription using direct SQL
    const subscriptionRows = await prisma.$queryRaw`SELECT * FROM "UserSubscription" WHERE "userId" = ${user.id}`;
    
    if (subscriptionRows.length > 0) {
      const subscription = subscriptionRows[0];
      console.log('✅ Subscription found:', {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate
      });
    } else {
      console.log('❌ No subscription found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser(); 