import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    console.log('🔔 MercadoPago webhook received:', {
      type: data.type,
      data_id: data.data?.id,
      external_reference: data.data?.external_reference,
      timestamp: new Date().toISOString(),
    });

    // Handle payment notifications
    if (data.type === 'payment') {
      const paymentId = data.data.id;
      
      console.log('💰 Processing payment ID:', paymentId);
      
      // Get payment details from MercadoPago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_SANDBOX_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      if (!paymentResponse.ok) {
        console.error('❌ Failed to fetch payment details:', paymentResponse.status);
        return NextResponse.json({ error: 'Failed to fetch payment details' }, { status: 400 });
      }

      const payment = await paymentResponse.json();
      
      console.log('💳 Payment details:', {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference,
        amount: payment.transaction_amount,
        currency: payment.currency_id,
        payer_email: payment.payer?.email,
      });

      // Only process approved payments
      if (payment.status !== 'approved') {
        console.log('⏳ Payment not approved, status:', payment.status);
        return NextResponse.json({ message: 'Payment not approved' });
      }

      // Parse external reference to get user and plan info
      const externalRef = payment.external_reference;
      if (!externalRef || !externalRef.startsWith('subscription_')) {
        console.error('❌ Invalid external reference:', externalRef);
        return NextResponse.json({ error: 'Invalid external reference' }, { status: 400 });
      }

      const [, userEmail, planId, billingCycle] = externalRef.split('_');
      
      console.log('📧 Parsed external reference:', {
        userEmail,
        planId,
        billingCycle,
        fullReference: externalRef,
      });
      
      if (!userEmail || !planId || !billingCycle) {
        console.error('❌ Invalid external reference format:', externalRef);
        return NextResponse.json({ error: 'Invalid external reference format' }, { status: 400 });
      }

      // Determine subscription tier based on payment amount
      const amount = payment.transaction_amount;
      const currency = payment.currency_id;
      
      console.log('🔍 Processing subscription upgrade:', {
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
        console.log(`🔍 Checking plan ${plan.id}: expected ${planPrice}, got ${amount}`);
        if (planPrice === amount) {
          selectedPlan = plan;
          console.log('✅ Found matching plan:', plan.name);
          break;
        }
      }

      if (!selectedPlan) {
        console.error('❌ No plan found for amount:', amount);
        console.log('📋 Available plans:', SUBSCRIPTION_PLANS.map(p => ({
          id: p.id,
          monthly: p.monthlyPrice,
          yearly: p.yearlyPrice
        })));
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

      console.log('📅 Subscription dates:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      try {
        const pool = createPool();
        
        // Check if user exists
        console.log('🔍 Looking for user with email:', userEmail);
        const userResult = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [userEmail]
        );

        if (userResult.rows.length === 0) {
          console.error('❌ User not found:', userEmail);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userResult.rows[0];
        console.log('✅ User found:', {
          id: user.id,
          email: user.email,
          name: user.name,
        });

        // Create or update the user's subscription
        const subscriptionData = {
          userId: user.id,
          tier: selectedPlan.id,
          status: 'active',
          startDate,
          endDate,
        };

        console.log('💾 Saving subscription data:', subscriptionData);

        // Check if subscription exists
        const existingSubscription = await pool.query(
          'SELECT * FROM "UserSubscription" WHERE "userId" = $1',
          [user.id]
        );

        if (existingSubscription.rows.length > 0) {
          // Update existing subscription
          await pool.query(`
            UPDATE "UserSubscription" 
            SET tier = $1, status = $2, "startDate" = $3, "endDate" = $4
            WHERE "userId" = $5
          `, [selectedPlan.id, 'active', startDate, endDate, user.id]);
        } else {
          // Create new subscription
          await pool.query(`
            INSERT INTO "UserSubscription" (id, "userId", tier, status, "startDate", "endDate")
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user.id,
            selectedPlan.id,
            'active',
            startDate,
            endDate
          ]);
        }

        console.log('✅ Subscription created/updated successfully for user:', userEmail);

        return NextResponse.json({ 
          success: true, 
          message: 'Subscription updated successfully',
        });

      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }

    // Handle other webhook types if needed
    console.log('📝 Unhandled webhook type:', data.type);
    return NextResponse.json({ message: 'Webhook received' });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
} 