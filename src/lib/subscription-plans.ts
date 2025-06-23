import { SubscriptionPlan } from '../types/subscription';

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
    id: 'essential',
    name: 'Essential',
    description: 'Ideal para pequeños negocios y emprendedores.',
    color: 'green',
    marcaLimit: 10,
    pdfLimit: 10,
    monthlyPrice: 40000,
    yearlyPrice: 400000,
    features: [
      'Hasta 10 marcas',
      'Hasta 10 PDFs por marca',
      'Gestión completa de marcas',
      'Notificaciones avanzadas'
    ]
  },
  {
    id: 'pro',
    name: 'Trademark Pro',
    description: 'Perfecto para agencias y profesionales con múltiples clientes.',
    popular: true,
    color: 'blue',
    marcaLimit: 25,
    pdfLimit: 15,
    monthlyPrice: 60000,
    yearlyPrice: 600000,
    features: [
      'Hasta 25 marcas',
      'Hasta 15 PDFs por marca',
      'Gestión profesional',
      'Soporte prioritario'
    ]
  },
  {
    id: 'master',
    name: 'Master Brand',
    description: 'La solución definitiva para grandes empresas y corporaciones.',
    color: 'purple',
    marcaLimit: -1, // Unlimited
    pdfLimit: 20,
    monthlyPrice: 90000,
    yearlyPrice: 900000,
    features: [
      'Marcas ilimitadas',
      'Hasta 20 PDFs por marca',
      'Gestión empresarial',
      'Soporte premium'
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