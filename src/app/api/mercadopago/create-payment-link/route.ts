import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPlanById } from '@/lib/subscription-plans';
import { environmentInfo } from '@/lib/mercadopago-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { planId, billingCycle, marcaCount } = await request.json();

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
    }

    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const period = billingCycle === 'monthly' ? 'mes' : 'año';

    // Create payment link data
    const paymentLinkData = {
      title: `Plan ${plan.name} - ${period}`,
      unit_price: price,
      quantity: 1,
      currency_id: 'ARS',
      description: `Suscripción ${period} al plan ${plan.name} - Hasta ${plan.marcaLimit === -1 ? 'ilimitadas' : plan.marcaLimit} marcas`,
      external_reference: `subscription_${session.user.email}_${planId}_${billingCycle}`,
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/dashboard?payment=success&plan=${planId}`,
        failure: `${process.env.NEXTAUTH_URL}/dashboard?payment=failure&plan=${planId}`,
        pending: `${process.env.NEXTAUTH_URL}/dashboard?payment=pending&plan=${planId}`,
      },
      notification_url: `${process.env.NEXTAUTH_URL}/api/mercadopago/webhook`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };

    try {
      // Create payment link using MercadoPago API
      const response = await fetch('https://api.mercadopago.com/v1/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_SANDBOX_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [paymentLinkData],
          payer: {
            email: session.user.email,
            name: session.user.name || 'Usuario',
          },
          auto_return: 'approved',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('MercadoPago API error:', errorData);
        
        // Fallback mock response for testing
        if (environmentInfo.environment === 'Sandbox') {
          console.log('Using mock payment link for testing');
          return NextResponse.json({
            id: 'mock_payment_link',
            init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock_payment_link',
            sandbox_init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock_payment_link',
            environment: 'Sandbox (Mock)',
            description: 'Mock payment link for testing - no real payment processing',
            testCards: {
              approved: '4509 9535 6623 3704',
              cvv: '123',
              expiration: '12/25',
            },
            mock: true,
          });
        }
        
        throw new Error(`MercadoPago API error: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();

      return NextResponse.json({
        id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point,
        environment: environmentInfo.environment,
        description: environmentInfo.description,
        testCards: environmentInfo.isProduction ? null : {
          approved: '4509 9535 6623 3704',
          cvv: '123',
          expiration: '12/25',
        },
      });

    } catch (mercadopagoError) {
      console.error('MercadoPago API error:', mercadopagoError);
      
      // Fallback mock response for testing
      if (environmentInfo.environment === 'Sandbox') {
        console.log('Using mock response for testing');
        return NextResponse.json({
          id: 'mock_preference_id',
          init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock_preference_id',
          sandbox_init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock_preference_id',
          environment: 'Sandbox (Mock)',
          description: 'Mock response for testing - no real payment processing',
          testCards: {
            approved: '4509 9535 6623 3704',
            cvv: '123',
            expiration: '12/25',
          },
          mock: true,
        });
      }
      
      throw mercadopagoError;
    }
  } catch (error) {
    console.error('Error creating MercadoPago payment link:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 