import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../../../lib/auth';
import { getDB } from '../../../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDB();
    const userId = params.id;

    // Get order count and total spent
    const orderStats = await db.get(`
      SELECT 
        COUNT(*) as orderCount,
        SUM(o.total) as totalSpent
      FROM orders o
      WHERE o.userId = ?
    `, [userId]);

    return NextResponse.json({
      orderCount: orderStats?.orderCount || 0,
      totalSpent: orderStats?.totalSpent || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}