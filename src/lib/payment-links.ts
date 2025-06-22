// Configuration for MercadoPago Payment Links
// These are the preference IDs from your MercadoPago Developer Dashboard

export interface PaymentLinkConfig {
  monthly: string;
  yearly: string;
}

export const PAYMENT_LINKS: Record<string, PaymentLinkConfig> = {
  essential: {
    monthly: '574639139-3ee1d428-9325-4e41-b605-52165c1e5dce', // $40,000 ARS
    yearly: '574639139-1788a8ab-dcb3-4ff5-a22d-316ee00316c1', // $400,000 ARS
  },
  pro: {
    monthly: '574639139-7c3df6a6-35a8-4208-80b5-21118caf9f68', // $60,000 ARS
    yearly: '574639139-9a02c0ef-fed4-442e-ac3c-9d235009e37b', // $600,000 ARS
  },
  master: {
    monthly: '574639139-34f52e86-9535-4189-b75f-29440eec7da4', // $90,000 ARS
    yearly: '574639139-e1ca578c-adb1-4249-80b5-4fd0e00d9c18', // $900,000 ARS
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
    essential: { monthly: 40000, yearly: 400000 },
    pro: { monthly: 60000, yearly: 600000 },
    master: { monthly: 90000, yearly: 900000 },
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