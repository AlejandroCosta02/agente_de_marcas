export interface SubscriptionPlan {
  id: string;
  name: string;
  color: string;
  popular?: boolean;
  marcaLimit: number;
  pdfLimit: number;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratis',
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
    color: 'blue',
    popular: true,
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