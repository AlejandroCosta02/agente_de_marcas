import type { SubscriptionPlan } from '../types/subscription.ts';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratis',
    description: 'Para individuos que están empezando a gestionar sus marcas.',
    color: 'gray',
    marcaLimit: 4,
    pdfLimit: 5,
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Hasta 4 marcas',
      'Hasta 5 PDFs por marca',
      'Gestión básica de marcas',
      'Notificaciones de vencimiento'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Custodia ilimitada de marcas y soporte premium. 2 meses gratis pagando anual.',
    color: 'blue',
    marcaLimit: -1, // Unlimited
    pdfLimit: 20,
    monthlyPrice: 25000,
    yearlyPrice: 250000,
    features: [
      'Marcas ilimitadas',
      'Hasta 20 PDFs por marca',
      'Gestión profesional',
      'Soporte premium',
      '2 meses gratis pagando anual'
    ]
  }
];

export const getPaidPlans = (): SubscriptionPlan[] => {
  return SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'free');
};

export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === id);
};

export const getFreePlan = (): SubscriptionPlan => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === 'free')!;
}; 