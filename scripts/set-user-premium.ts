import { db } from '../src/lib/db';
import { getPlanById } from '../src/lib/subscription-plans';

async function main() {
  // Hardcode the user email and plan for manual upgrade
  const userEmail = 'lucianadinoto@gmail.com';
  const planId = 'master';
  const billingCycle = 'yearly';

  if (!userEmail) {
    console.error('Por favor, proporciona el email del usuario.');
    process.exit(1);
  }

  const user = await db.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error(`No se encontró ningún usuario con el email: ${userEmail}`);
    process.exit(1);
  }

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

  await db.userSubscription.upsert({
    where: { userId: user.id },
    update: subscriptionData,
    create: subscriptionData,
  });

  console.log(`¡Éxito! El usuario ${user.name} (${user.email}) ahora tiene el plan ${plan.name} (${billingCycle}).`);
  console.log(`La suscripción es válida hasta: ${endDate.toLocaleDateString('es-AR')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  }); 