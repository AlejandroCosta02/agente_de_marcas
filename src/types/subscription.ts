export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  marcaLimit: number;
  pdfLimit: number;
  features: string[];
  popular?: boolean;
  color?: 'green' | 'blue' | 'purple' | 'gray';
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
  tier: SubscriptionTier;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'cancelled';
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