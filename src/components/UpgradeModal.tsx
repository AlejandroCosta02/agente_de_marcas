'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCreditCard, FaCrown, FaCheck, FaCopy } from 'react-icons/fa';
import { getPaidPlans } from '@/lib/subscription-plans';
import { SubscriptionPlan } from '@/types/subscription';
import { getPaymentLinkUrl, isPaymentLinkConfigured } from '@/lib/payment-links';
import Image from 'next/image';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
};

const BANK_ALIAS = 'alejandrocosta.dev';
const BANK_CBU = '0000003100096180511915';
const USDT_BNB = '0x3E52B44d83BDE2388A72Ec976E8b4d79f71C2BD4';
const USDT_TRON = 'TU9HtKd6L9YQhtRJhYX2Xf8uPK9D7wkF7d';
const USDC_BNB = '0x3E52B44d83BDE2388A72Ec976E8b4d79f71C2BD4';
const USDC_STELLAR = 'GBRIT4C6Q4LDBD6J2B3WC6F6TOZ3TVFSUZ4HTNZCB6CZAF6SA332CORI';
const STELLAR_MEMO = '1776313069';
const CRYPTO_RATE = 1300;

function formatCrypto(amount: number) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer' | 'crypto'>('mercadopago');
  const [copied, setCopied] = useState<string | null>(null);

  const paidPlans = getPaidPlans();

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPaymentMethod('mercadopago');
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };

  const getDiscountedPrice = (price: number) => Math.round(price * 0.85);
  const getCryptoAmount = (price: number) => getDiscountedPrice(price) / CRYPTO_RATE;

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    
    try {
      // Get the payment link URL for the selected plan and billing cycle
      const paymentUrl = getPaymentLinkUrl(selectedPlan.id, billingCycle);
      
      if (!paymentUrl) {
        // Show mock response for testing or missing links
        alert(`🎉 ¡Simulación exitosa!\n\nPlan: ${selectedPlan.name}\nPrecio: ${formatPrice(billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice)}/${billingCycle === 'monthly' ? 'mes' : 'año'}\n\nPara configurar el pago real, agrega el ID del Link de Pago en src/lib/payment-links.ts`);
        onClose();
        return;
      }

      // Redirect to MercadoPago payment link
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIconClasses = (plan: SubscriptionPlan) => {
    if (plan.id === 'free') return 'text-gray-500';
    
    switch (plan.color) {
      case 'green':
        return 'text-green-500';
      case 'blue':
        return 'text-blue-500';
      case 'purple':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Actualiza tu Plan
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Desbloquea más marcas y funcionalidades
                  </p>
                  
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Pago 100% seguro</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Datos encriptados</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Facturación:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mensual
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      billingCycle === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Anual
                    <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      -17%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paidPlans.map((plan) => {
                  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                  const isSelected = selectedPlan?.id === plan.id;
                  const isConfigured = isPaymentLinkConfigured(plan.id, billingCycle);
                  
                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      } ${!isConfigured ? 'opacity-60' : ''}`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                            Más Popular
                          </span>
                        </div>
                      )}
                      
                      {!isConfigured && (
                        <div className="absolute -top-3 right-2">
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Configurar
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                          <FaCrown className={`text-2xl ${getPlanIconClasses(plan)}`} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {plan.name}
                        </h3>
                        
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900">
                            {formatPrice(price)}
                          </span>
                          <span className="text-gray-600">/{billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <FaCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className={`w-6 h-6 rounded-full border-2 mx-auto ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Payment Section */}
            {selectedPlan && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Plan seleccionado: {selectedPlan.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {formatPrice(billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice)}/{billingCycle === 'monthly' ? 'mes' : 'año'}
                    </p>
                  </div>
                </div>
                {/* Payment Method Selection */}
                {(
                  <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <button
                      onClick={() => setPaymentMethod('mercadopago')}
                      className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium flex items-center justify-center gap-2 text-gray-900 hover:shadow-lg hover:text-gray-900 ${paymentMethod === 'mercadopago' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                      <Image src="/mercadopago-logo-official.svg" alt="MercadoPago" width={24} height={24} className="h-6" />
                      MercadoPago
                    </button>
                    <button
                      onClick={() => setPaymentMethod('transfer')}
                      className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium flex items-center justify-center gap-2 text-gray-900 hover:shadow-lg hover:text-gray-900 ${paymentMethod === 'transfer' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
                    >
                      <FaCreditCard className="text-green-500" />
                      Transferencia 15% OFF
                    </button>
                    <button
                      onClick={() => setPaymentMethod('crypto')}
                      className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium flex items-center justify-center gap-2 text-gray-900 hover:shadow-lg hover:text-gray-900 ${paymentMethod === 'crypto' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white'}`}
                    >
                      <FaCrown className="text-yellow-500" />
                      Cripto 15% OFF
                    </button>
                  </div>
                )}

                {/* MercadoPago Payment */}
                {paymentMethod === 'mercadopago' && (
                  <div className="mt-8">
                    <div className="flex items-center space-x-2 text-gray-500 text-sm mb-4">
                      <Image src="/mercadopago-logo-official.svg" alt="MercadoPago" width={100} height={40} style={{ width: '100px', height: 'auto' }} />
                    </div>
                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <FaCreditCard />
                      <span>{loading ? 'Procesando...' : 'Pagar'}</span>
                    </button>
                  </div>
                )}

                {/* Transferencia Payment */}
                {paymentMethod === 'transfer' && (
                  <div className="mt-8">
                    <div className="mb-4">
                      <span className="block text-lg font-bold text-green-700">Precio final con 15% OFF:</span>
                      <span className="block text-2xl font-bold text-green-900">{formatPrice(getDiscountedPrice(billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice))} /{billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleCopy(BANK_CBU)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold">Copiar CBU</button>
                        {copied === BANK_CBU && <span className="text-green-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => handleCopy(BANK_ALIAS)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold">Copiar Alias</button>
                        {copied === BANK_ALIAS && <span className="text-green-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-700">
                      <div><span className="font-semibold">Nombre del titular:</span> Costa Claudio Alejandro</div>
                      <div><span className="font-semibold">Entidad bancaria:</span> Mercadopago</div>
                    </div>
                    <div className="mb-4 text-sm text-gray-700">
                      <ol className="list-decimal ml-5 space-y-1">
                        <li>Realizá la transferencia al alias o CBU.</li>
                        <li>Tomá una captura del comprobante.</li>
                        <li>Enviá el comprobante a <b>contacto@agendatusmarcas.com</b>.</li>
                        <li>El acceso premium puede demorar hasta <b>5hs</b> en activarse por alta demanda.</li>
                      </ol>
                    </div>
                    <button
                      onClick={onClose}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Confirmar pago
                    </button>
                    <button
                      onClick={() => setPaymentMethod('mercadopago')}
                      className="mt-2 text-gray-500 underline block mx-auto"
                    >
                      Volver
                    </button>
                  </div>
                )}

                {/* Cripto Payment */}
                {paymentMethod === 'crypto' && (
                  <div className="mt-8">
                    <div className="mb-4">
                      <span className="block text-lg font-bold text-yellow-700">Precio final con 15% OFF:</span>
                      <span className="block text-2xl font-bold text-yellow-900">{formatPrice(getDiscountedPrice(billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice))} /{billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                      <span className="block text-lg mt-2">Equivalente en USDT/USDC:</span>
                      <span className="block text-xl font-bold text-yellow-900">
                        {formatCrypto(getCryptoAmount(billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice))} USDT/USDC
                      </span>
                      <span className="block text-xs text-gray-500">(Tasa fija: $1.300 ARS = 1 USDT/USDC)</span>
                    </div>
                    <div className="mb-4">
                      <div className="font-semibold mb-1 text-gray-800">USDT (BNB Chain):</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-900 font-semibold">{USDT_BNB}</span>
                        <button onClick={() => handleCopy(USDT_BNB)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold"><FaCopy /></button>
                        {copied === USDT_BNB && <span className="text-yellow-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                      <div className="font-semibold mb-1 text-gray-800">USDT (Tron):</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-900 font-semibold">{USDT_TRON}</span>
                        <button onClick={() => handleCopy(USDT_TRON)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold"><FaCopy /></button>
                        {copied === USDT_TRON && <span className="text-yellow-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                      <div className="font-semibold mb-1 text-gray-800">USDC (BNB Chain):</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-900 font-semibold">{USDC_BNB}</span>
                        <button onClick={() => handleCopy(USDC_BNB)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold"><FaCopy /></button>
                        {copied === USDC_BNB && <span className="text-yellow-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                      <div className="font-semibold mb-1 text-gray-800">USDC (Stellar):</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-900 font-semibold">{USDC_STELLAR}</span>
                        <button onClick={() => handleCopy(USDC_STELLAR)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold"><FaCopy /></button>
                        {copied === USDC_STELLAR && <span className="text-yellow-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                      <div className="font-semibold mb-1 text-gray-800">Memo (Stellar):</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-900 font-semibold">{STELLAR_MEMO}</span>
                        <button onClick={() => handleCopy(STELLAR_MEMO)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold"><FaCopy /></button>
                        {copied === STELLAR_MEMO && <span className="text-yellow-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                    </div>
                    <div className="mb-4 text-sm text-gray-700">
                      <ol className="list-decimal ml-5 space-y-1">
                        <li>Realizá el pago a la wallet seleccionada.</li>
                        <li>Tomá una captura del comprobante.</li>
                        <li>Enviá el comprobante a <b>contacto@agendatusmarcas.com</b>.</li>
                        <li>El acceso premium puede demorar hasta <b>5hs</b> en activarse por alta demanda.</li>
                      </ol>
                    </div>
                    <button
                      onClick={onClose}
                      className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Confirmar pago
                    </button>
                    <button
                      onClick={() => setPaymentMethod('mercadopago')}
                      className="mt-2 text-gray-500 underline block mx-auto"
                    >
                      Volver
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 