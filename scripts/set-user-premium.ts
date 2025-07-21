import { createPool } from '@vercel/postgres';
import { getPlanById } from '../src/lib/subscription-plans';

async function main() {
  // Hardcode the user email and plan for manual upgrade
  const userEmail = 'lucianadinoto@gmail.com';
  const planId = 'premium';
  const billingCycle = 'yearly';

  if (!userEmail) {
    console.error('Por favor, proporciona el email del usuario.');
    process.exit(1);
  }

  const pool = createPool();

  const userResult = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [userEmail]
  );

  if (userResult.rows.length === 0) {
    console.error(`No se encontró ningún usuario con el email: ${userEmail}`);
    process.exit(1);
  }

  const user = userResult.rows[0];

  const plan = getPlanById(planId);
  if (!plan) {
    console.error(`Plan con ID "${planId}" no encontrado.`);
    process.exit(1);
  }

  const startDate = new Date();
  const endDate = new Date();

  if (billingCycle === 'yearly') {
    endDate.setFullYear(startDate.getFullYear() + 1);
  } else if (billingCycle === 'monthly') {
    endDate.setMonth(startDate.getMonth() + 1);
  } else {
    console.error('Ciclo de facturación no válido. Usa "monthly" o "yearly".');
    process.exit(1);
  }

  const subscriptionData = {
    userId: user.id,
    tier: plan.id,
    startDate,
    endDate,
    status: 'active',
  };

  // Check if subscription exists
  const existingSubscription = await pool.query(
    'SELECT * FROM "UserSubscription" WHERE "userId" = $1',
    [user.id]
  );

  if (existingSubscription.rows.length > 0) {
    // Update existing subscription
    await pool.query(`
      UPDATE "UserSubscription" 
      SET tier = $1, status = $2, "startDate" = $3, "endDate" = $4
      WHERE "userId" = $5
    `, [plan.id, 'active', startDate, endDate, user.id]);
  } else {
    // Create new subscription
    await pool.query(`
      INSERT INTO "UserSubscription" (id, "userId", tier, status, "startDate", "endDate")
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user.id,
      plan.id,
      'active',
      startDate,
      endDate
    ]);
  }

  console.log(`¡Éxito! El usuario ${user.name} (${user.email}) ahora tiene el plan ${plan.name} (${billingCycle}).`);
  console.log(`La suscripción es válida hasta: ${endDate.toLocaleDateString('es-AR')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // No need to disconnect pool as it's managed by Vercel Postgres
  }); 