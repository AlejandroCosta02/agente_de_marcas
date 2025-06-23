import { PrismaClient } from '@prisma/client';
import { getPlanById } from '../src/lib/subscription-plans.ts';

const prisma = new PrismaClient();

async function main() {
  const userEmail = process.argv[2];
  const planId = process.argv[3] || 'master'; 
  const billingCycle = process.argv[4] || 'yearly'; 

  if (!userEmail) {
    console.error('Por favor, proporciona el email del usuario.');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
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

  await prisma.userSubscription.upsert({
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
    await prisma.$disconnect();
  }); 