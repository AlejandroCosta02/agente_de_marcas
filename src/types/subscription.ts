export type SubscriptionTier = 'free' | 'essential' | 'pro' | 'master';

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

export interface SubscriptionStatus {
  plan: string;
  marcaCount: number;
  marcaLimit: number;
  pdfCount: number;
  pdfLimit: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  mercadopagoSubscriptionId?: string;
  autoRenew: boolean;
}

export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface PaymentResult {
  success: boolean;
  subscriptionId?: string;
  error?: string;
} 