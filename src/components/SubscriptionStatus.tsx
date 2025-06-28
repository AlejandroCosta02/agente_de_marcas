'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { SubscriptionPlan, UserSubscription } from '@/types/subscription';
import { getPlanById, getFreePlan } from '@/lib/subscription-plans';
import { FaCrown, FaInfoCircle, FaFilePdf } from 'react-icons/fa';

interface SubscriptionStatusProps {
  marcaCount: number;
  onUpgradeClick: () => void;
}

export default function SubscriptionStatus({ marcaCount, onUpgradeClick }: SubscriptionStatusProps) {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    fetchSubscription();
  }, [session?.user?.email]);

  const currentPlan = subscription ? getPlanById(subscription.tier) : getFreePlan();
  const isUnlimitedMarcas = currentPlan?.marcaLimit === -1;
  const marcaUsagePercentage = isUnlimitedMarcas ? 0 : (marcaCount / currentPlan!.marcaLimit) * 100;
  const isNearMarcaLimit = marcaUsagePercentage >= 80;
  const isAtMarcaLimit = marcaUsagePercentage >= 100;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
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

  const getPlanBorderColor = (plan: SubscriptionPlan) => {
    if (!plan) return 'border-t-gray-300';
    switch (plan.color) {
      case 'green': return 'border-t-green-500';
      case 'blue': return 'border-t-blue-500';
      case 'purple': return 'border-t-purple-500';
      default: return 'border-t-gray-300';
    }
  };

  if (!currentPlan) {
    // This can happen briefly while the subscription is loading
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 border-t-4 ${getPlanBorderColor(currentPlan)}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {currentPlan?.id !== 'free' && (
            <FaCrown className={getPlanIconClasses(currentPlan)} />
          )}
          <h3 className="font-semibold text-gray-900">
            Plan {currentPlan?.name}
          </h3>
          {currentPlan?.popular && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Más Popular
            </span>
          )}
        </div>
        {currentPlan?.id === 'free' && (
          <div className="flex items-center space-x-3">
            {/* MercadoPago Logo */}
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <span>Powered by</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/mercadopago-logo-official.svg" 
                alt="Mercado Pago" 
                className="h-4"
              />
            </div>
            
            <button
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
            >
              Actualizar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Marcas Usage */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Marcas utilizadas</span>
            <span className={getStatusColor(marcaUsagePercentage)}>
              {marcaCount} {isUnlimitedMarcas ? '' : `/ ${currentPlan?.marcaLimit}`}
            </span>
          </div>
          {!isUnlimitedMarcas && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(marcaUsagePercentage)}`}
                style={{ width: `${Math.min(marcaUsagePercentage, 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* PDFs Usage */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span className="flex items-center">
              <FaFilePdf className="mr-1" />
              PDFs por marca
            </span>
            <span className="text-gray-600">
              Hasta {currentPlan?.pdfLimit}
            </span>
          </div>
        </div>

        {/* Limit Warnings */}
        {isAtMarcaLimit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FaInfoCircle className="text-red-500" />
              <span className="text-red-700 text-sm font-medium">
                Has alcanzado el límite de marcas para tu plan actual
              </span>
            </div>
            <button
              onClick={onUpgradeClick}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
            >
              Actualizar Plan
            </button>
          </div>
        )}

        {isNearMarcaLimit && !isAtMarcaLimit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FaInfoCircle className="text-yellow-500" />
              <span className="text-yellow-700 text-sm">
                Estás cerca del límite de marcas ({Math.round(marcaUsagePercentage)}%)
              </span>
            </div>
          </div>
        )}

        {subscription && subscription.status === 'active' && (
          <div className="text-xs text-gray-500">
            Renovación: {new Date(subscription.endDate).toLocaleDateString('es-AR')}
          </div>
        )}
      </div>
    </div>
  );
} 