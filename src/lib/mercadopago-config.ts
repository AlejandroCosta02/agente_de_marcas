import { MercadoPagoConfig } from 'mercadopago';

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';

// MercadoPago configuration
export const mercadopagoConfig = {
  // Sandbox credentials (for testing) - These are MercadoPago's official test credentials
  sandbox: {
    accessToken: process.env.MERCADOPAGO_SANDBOX_ACCESS_TOKEN || 'TEST-6295877106811190-062017-8e6e1a2888d7dd677cbef397a7638f5f-__LB__-2',
    publicKey: process.env.MERCADOPAGO_SANDBOX_PUBLIC_KEY || 'TEST-6295877106811190-062017-8e6e1a2888d7dd677cbef397a7638f5f-__LB__-2',
  },
  // Production credentials (for real payments)
  production: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
  }
};

// Get current configuration based on environment
export const getCurrentConfig = () => {
  return isProduction ? mercadopagoConfig.production : mercadopagoConfig.sandbox;
};

// Create MercadoPago client
export const createMercadoPagoClient = () => {
  const config = getCurrentConfig();
  return new MercadoPagoConfig({
    accessToken: config.accessToken,
  });
};

// Test card numbers for sandbox
export const testCards = {
  approved: '4509 9535 6623 3704',
  pending: '4509 9535 6623 3704',
  rejected: '4509 9535 6623 3704',
  expired: '4509 9535 6623 3704',
};

// Environment info
export const environmentInfo = {
  isProduction,
  environment: isProduction ? 'Production' : 'Sandbox',
  description: isProduction 
    ? 'Real payments will be processed' 
    : 'Test payments only - no real money charged',
}; 