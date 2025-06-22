import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserSubscription } from '@/types/subscription';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // In a real implementation, you would:
    // 1. Query your database for the user's subscription
    // 2. Check if it's active and not expired
    // 3. Return the subscription details

    // Mock subscription data for now
    const mockSubscription: UserSubscription | null = null; // Default to free plan

    return NextResponse.json({
      subscription: mockSubscription,
      isFree: true, // Default to free plan for now
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 