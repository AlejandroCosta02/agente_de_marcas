import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    console.log('MercadoPago webhook received:', {
      type: data.type,
      data_id: data.data?.id,
      external_reference: data.data?.external_reference,
    });

    // Handle payment notifications
    if (data.type === 'payment') {
      const paymentId = data.data.id;
      
      // Get payment details from MercadoPago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_SANDBOX_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      if (!paymentResponse.ok) {
        console.error('Failed to fetch payment details:', paymentResponse.status);
        return NextResponse.json({ error: 'Failed to fetch payment details' }, { status: 400 });
      }

      const payment = await paymentResponse.json();
      
      console.log('Payment details:', {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference,
        amount: payment.transaction_amount,
        currency: payment.currency_id,
      });

      // Only process approved payments
      if (payment.status !== 'approved') {
        console.log('Payment not approved, status:', payment.status);
        return NextResponse.json({ message: 'Payment not approved' });
      }

      // Parse external reference to get user and plan info
      const externalRef = payment.external_reference;
      if (!externalRef || !externalRef.startsWith('subscription_')) {
        console.error('Invalid external reference:', externalRef);
        return NextResponse.json({ error: 'Invalid external reference' }, { status: 400 });
      }

      const [, userEmail, planId, billingCycle] = externalRef.split('_');
      
      if (!userEmail || !planId || !billingCycle) {
        console.error('Invalid external reference format:', externalRef);
        return NextResponse.json({ error: 'Invalid external reference format' }, { status: 400 });
      }

      // Determine subscription tier based on payment amount
      const amount = payment.transaction_amount;
      const currency = payment.currency_id;
      
      console.log('Processing subscription upgrade:', {
        userEmail,
        planId,
        billingCycle,
        amount,
        currency,
      });

      // Find the plan based on payment amount
      let selectedPlan = null;
      for (const plan of SUBSCRIPTION_PLANS) {
        const planPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
        if (planPrice === amount) {
          selectedPlan = plan;
          break;
        }
      }

      if (!selectedPlan) {
        console.error('No plan found for amount:', amount);
        return NextResponse.json({ error: 'No plan found for payment amount' }, { status: 400 });
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      
      if (billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      try {
        // Check if user exists
        const user = await db.user.findUnique({
          where: { email: userEmail }
        });

        if (!user) {
          console.error('User not found:', userEmail);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // For now, we'll store subscription data in a simple format
        // In a production app, you'd want to create a proper UserSubscription model
        console.log('Successfully processed subscription upgrade:', {
          userEmail,
          plan: selectedPlan.name,
          tier: selectedPlan.id,
          startDate,
          endDate,
          paymentId,
          billingCycle,
        });

        // TODO: Create a proper UserSubscription model in Prisma schema
        // For now, we'll just log the successful payment
        // The subscription status API can be updated to check MercadoPago directly

        return NextResponse.json({ 
          success: true, 
          message: 'Payment processed successfully',
          userEmail,
          plan: selectedPlan.name,
          tier: selectedPlan.id,
          startDate,
          endDate,
          paymentId,
        });

      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }

    // Handle other webhook types if needed
    console.log('Unhandled webhook type:', data.type);
    return NextResponse.json({ message: 'Webhook received' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
} 