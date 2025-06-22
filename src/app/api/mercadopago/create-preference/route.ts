import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPlanById } from '@/lib/subscription-plans';
import { Preference } from 'mercadopago';
import { createMercadoPagoClient, environmentInfo } from '@/lib/mercadopago-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { planId, billingCycle } = await request.json();

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
    }

    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const period = billingCycle === 'monthly' ? 'mes' : 'año';

    // Create MercadoPago client
    const client = createMercadoPagoClient();
    const preference = new Preference(client);

    // Create preference data
    const preferenceData = {
      items: [
        {
          id: planId,
          title: `Plan ${plan.name} - ${period}`,
          unit_price: price,
          quantity: 1,
          currency_id: 'ARS',
          description: `Suscripción ${period} al plan ${plan.name} - Hasta ${plan.marcaLimit === -1 ? 'ilimitadas' : plan.marcaLimit} marcas`,
        },
      ],
      payer: {
        email: session.user.email,
        name: session.user.name || 'Usuario',
      },
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/dashboard?payment=success&plan=${planId}`,
        failure: `${process.env.NEXTAUTH_URL}/dashboard?payment=failure&plan=${planId}`,
        pending: `${process.env.NEXTAUTH_URL}/dashboard?payment=pending&plan=${planId}`,
      },
      auto_return: 'approved',
      external_reference: `subscription_${session.user.email}_${planId}_${billingCycle}`,
      notification_url: `${process.env.NEXTAUTH_URL}/api/mercadopago/webhook`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };

    try {
      const response = await preference.create({ body: preferenceData });

      return NextResponse.json({
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
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
    console.error('Error creating MercadoPago preference:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 