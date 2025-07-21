'use client';

import React, { useState, useEffect } from 'react';
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

  const paidPlans = getPaidPlans(); // This will now only return the premium plan

  // Debug logging
  console.log('paidPlans:', paidPlans);
  console.log('selectedPlan:', selectedPlan);
  console.log('billingCycle:', billingCycle);

  // Always select the first plan by default
  useEffect(() => {
    if (!selectedPlan && paidPlans.length > 0) {
      setSelectedPlan(paidPlans[0]);
    }
  }, [selectedPlan, paidPlans]);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPaymentMethod('mercadopago');
  };

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
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
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  {paidPlans.length > 0 ? (
                    paidPlans.map((plan) => {
                      const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                      const isSelected = selectedPlan?.id === plan.id;
                      console.log('Rendering plan:', plan.id, 'price:', price, 'billingCycle:', billingCycle);
                      console.log('Plan object:', plan);
                      console.log('monthlyPrice:', plan.monthlyPrice, 'yearlyPrice:', plan.yearlyPrice);
                      
                      // Fallback to hardcoded price if needed
                      const displayPrice = price > 0 ? price : (billingCycle === 'monthly' ? 25000 : 250000);
                      
                      return (
                        <motion.div
                          key={plan.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 text-black ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          onClick={() => handlePlanSelect(plan)}
                        >
                          {billingCycle === 'yearly' && (
                            <div className="absolute -top-3 right-2">
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                2 meses gratis
                              </span>
                            </div>
                          )}
                          {/* Plan details here */}
                          <div className="text-black text-center">
                            <div className="mb-4">
                              <span className="block text-2xl font-bold mb-2">{plan.name}</span>
                              <span className="block text-xl font-semibold text-blue-600">
                                {formatPrice(displayPrice)} / {billingCycle === 'monthly' ? 'mes' : 'año'}
                              </span>
                            </div>
                            <ul className="text-left space-y-2">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="text-base text-black flex items-start">
                                  <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="p-6 rounded-xl border-2 border-gray-200 bg-white text-center">
                      <p className="text-gray-500">Cargando planes...</p>
                    </div>
                  )}
                </div>
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
                      {(() => {
                        const price = billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
                        const displayPrice = price > 0 ? price : (billingCycle === 'monthly' ? 25000 : 250000);
                        return `${formatPrice(displayPrice)}/${billingCycle === 'monthly' ? 'mes' : 'año'}`;
                      })()}
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
                      <span className="block text-2xl font-bold text-green-900">
                        {(() => {
                          const price = billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
                          const displayPrice = price > 0 ? price : (billingCycle === 'monthly' ? 25000 : 250000);
                          return formatPrice(getDiscountedPrice(displayPrice));
                        })()} /{billingCycle === 'monthly' ? 'mes' : 'año'}
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleCopy('bank_cbu', BANK_CBU)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold">Copiar CBU</button>
                        {copied === 'bank_cbu' && <span className="text-green-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => handleCopy('bank_alias', BANK_ALIAS)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold">Copiar Alias</button>
                        {copied === 'bank_alias' && <span className="text-green-600 ml-1 text-xs">¡Copiado!</span>}
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
                        <li>Enviá el comprobante a <b>consultas@gestionatusmarcas.com</b>.</li>
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
                    <div className="mb-6">
                      <span className="block text-xl font-extrabold text-yellow-700 tracking-tight">Precio final con 15% OFF:</span>
                      <span className="block text-3xl font-extrabold text-yellow-900 mb-2">
                        {(() => {
                          const price = billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
                          const displayPrice = price > 0 ? price : (billingCycle === 'monthly' ? 25000 : 250000);
                          return formatPrice(getDiscountedPrice(displayPrice));
                        })()} /{billingCycle === 'monthly' ? 'mes' : 'año'}
                      </span>
                      <span className="block text-base font-semibold text-gray-800 mt-4">Equivalente en USDT/USDC:</span>
                      <span className="block text-2xl font-bold text-yellow-900">
                        {(() => {
                          const price = billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
                          const displayPrice = price > 0 ? price : (billingCycle === 'monthly' ? 25000 : 250000);
                          return formatCrypto(getCryptoAmount(displayPrice));
                        })()} USDT/USDC
                      </span>
                      <span className="block text-xs text-gray-600 mt-1">(Tasa fija: $1.300 ARS = 1 USDT/USDC)</span>
                    </div>
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* USDT (BNB Chain) */}
                      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-2 transition-all duration-200 hover:shadow-md hover:border-yellow-400">
                        <div className="font-semibold text-gray-800 mb-1">USDT (BNB Chain):</div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-900 font-mono text-sm break-all select-all">{USDT_BNB}</span>
                          <button onClick={() => handleCopy('usdt_bnb', USDT_BNB)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold transition-colors duration-200"><FaCopy /></button>
                        </div>
                        {copied === 'usdt_bnb' && <span className="text-yellow-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                      {/* USDT (Tron) */}
                      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-2 transition-all duration-200 hover:shadow-md hover:border-yellow-400">
                        <div className="font-semibold text-gray-800 mb-1">USDT (Tron):</div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-900 font-mono text-sm break-all select-all">{USDT_TRON}</span>
                          <button onClick={() => handleCopy('usdt_tron', USDT_TRON)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold transition-colors duration-200"><FaCopy /></button>
                        </div>
                        {copied === 'usdt_tron' && <span className="text-yellow-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                      {/* USDC (BNB Chain) */}
                      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-2 transition-all duration-200 hover:shadow-md hover:border-yellow-400">
                        <div className="font-semibold text-gray-800 mb-1">USDC (BNB Chain):</div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-900 font-mono text-sm break-all select-all">{USDC_BNB}</span>
                          <button onClick={() => handleCopy('usdc_bnb', USDC_BNB)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold transition-colors duration-200"><FaCopy /></button>
                        </div>
                        {copied === 'usdc_bnb' && <span className="text-yellow-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                      {/* USDC (Stellar) + Memo */}
                      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-2 transition-all duration-200 hover:shadow-md hover:border-yellow-400">
                        <div className="font-semibold text-gray-800 mb-1">USDC (Stellar):</div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-gray-900 font-mono text-sm break-all select-all">{USDC_STELLAR}</span>
                          <button onClick={() => handleCopy('usdc_stellar', USDC_STELLAR)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold transition-colors duration-200"><FaCopy /></button>
                        </div>
                        {copied === 'usdc_stellar' && <span className="text-yellow-600 ml-1 text-xs">¡Copiado!</span>}
                        <div className="font-semibold text-gray-800 mb-1 mt-2">Memo (Stellar):</div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-900 font-mono text-sm break-all select-all">{STELLAR_MEMO}</span>
                          <button onClick={() => handleCopy('stellar_memo', STELLAR_MEMO)} className="ml-2 text-blue-600 hover:text-blue-800 font-bold transition-colors duration-200"><FaCopy /></button>
                        </div>
                        {copied === 'stellar_memo' && <span className="text-yellow-600 ml-1 text-xs">¡Copiado!</span>}
                      </div>
                    </div>
                    <div className="mb-6 text-sm text-gray-700">
                      <ol className="list-decimal ml-5 space-y-1">
                        <li>Realizá el pago a la wallet seleccionada.</li>
                        <li>Tomá una captura del comprobante.</li>
                        <li>Enviá el comprobante a <b>contacto@agendatusmarcas.com</b>.</li>
                        <li>El acceso premium puede demorar hasta <b>5hs</b> en activarse por alta demanda.</li>
                      </ol>
                    </div>
                    <div className="flex flex-col items-center gap-2 mt-6">
                      <button
                        onClick={onClose}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        Confirmar pago
                      </button>
                      <button
                        onClick={() => setPaymentMethod('mercadopago')}
                        className="text-gray-500 underline block mt-2"
                      >
                        Volver
                      </button>
                    </div>
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