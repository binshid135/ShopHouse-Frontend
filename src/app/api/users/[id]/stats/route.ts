import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../../../lib/auth';
import { query } from '../../../../../../lib/neon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Await the params first
    const { id } = await params;

    // Get order count and total spent
    const result = await query(`
      SELECT 
        COUNT(*) as "orderCount",
        SUM(o.total) as "totalSpent"
      FROM orders o
      WHERE o.user_id = $1
    `, [id]);

    const stats = result.rows[0] || { orderCount: 0, totalSpent: 0 };
    
    return NextResponse.json({
      orderCount: parseInt(stats.orderCount) || 0,
      totalSpent: parseFloat(stats.totalSpent) || 0
    });
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}