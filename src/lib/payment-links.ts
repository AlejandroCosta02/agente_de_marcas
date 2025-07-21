// Configuration for MercadoPago Payment Links
// These are the preference IDs from your MercadoPago Developer Dashboard

export interface PaymentLinkConfig {
  monthly: string;
  yearly: string;
}

export const PAYMENT_LINKS: Record<string, PaymentLinkConfig> = {
  premium: {
    monthly: 'https://mpago.li/1mjPZFn', // $25,000 ARS
    yearly: 'https://mpago.li/1tn4cBK', // $250,000 ARS (2 meses gratis)
  },
};

// Helper function to get payment link URL
export const getPaymentLinkUrl = (planId: string, billingCycle: 'monthly' | 'yearly'): string | null => {
  const linkId = PAYMENT_LINKS[planId]?.[billingCycle];
  
  if (!linkId || linkId.startsWith('YOUR_')) {
    return null; // Link not configured
  }
  
  return `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${linkId}`;
};

// Helper function to check if a payment link is configured
export const isPaymentLinkConfigured = (planId: string, billingCycle: 'monthly' | 'yearly'): boolean => {
  const linkId = PAYMENT_LINKS[planId]?.[billingCycle];
  return !!(linkId && !linkId.startsWith('YOUR_'));
};

// Get all configured payment links
export const getConfiguredPaymentLinks = (): Array<{planId: string, billingCycle: 'monthly' | 'yearly', linkId: string}> => {
  const configured: Array<{planId: string, billingCycle: 'monthly' | 'yearly', linkId: string}> = [];
  
  Object.entries(PAYMENT_LINKS).forEach(([planId, config]) => {
    Object.entries(config).forEach(([billingCycle, linkId]) => {
      if (linkId && !linkId.startsWith('YOUR_')) {
        configured.push({
          planId,
          billingCycle: billingCycle as 'monthly' | 'yearly',
          linkId,
        });
      }
    });
  });
  
  return configured;
};

// Get missing payment links (for setup guidance)
export const getMissingPaymentLinks = (): Array<{planId: string, billingCycle: 'monthly' | 'yearly', expectedAmount: number}> => {
  const missing: Array<{planId: string, billingCycle: 'monthly' | 'yearly', expectedAmount: number}> = [];
  
  const expectedAmounts = {
    premium: { monthly: 25000, yearly: 0 }, // Assuming yearly is 0 or not applicable
  };
  
  Object.entries(PAYMENT_LINKS).forEach(([planId, config]) => {
    Object.entries(config).forEach(([billingCycle, linkId]) => {
      if (!linkId || linkId.startsWith('YOUR_')) {
        missing.push({
          planId,
          billingCycle: billingCycle as 'monthly' | 'yearly',
          expectedAmount: expectedAmounts[planId as keyof typeof expectedAmounts]?.[billingCycle as 'monthly' | 'yearly'] || 0,
        });
      }
    });
  });
  
  return missing;
}; 