// app/api/products/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../../lib/auth';
import { getDB } from '../../../../../lib/database';

export async function PUT(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDB();
    const { productId, isRecommended, isMostRecommended, recommendationOrder } = await request.json();

    // Validation
    if (isMostRecommended) {
      const existingMostRecommended = await db.get(
        'SELECT id FROM products WHERE isMostRecommended = 1 AND id != ?', 
        [productId]
      );
      if (existingMostRecommended) {
        return NextResponse.json({ 
          error: 'There can only be one most recommended product' 
        }, { status: 400 });
      }
    }

    if (isRecommended && !isMostRecommended) {
      const recommendedCount = await db.get(
        'SELECT COUNT(*) as count FROM products WHERE isRecommended = 1 AND isMostRecommended = 0 AND id != ?',
        [productId]
      );
      if (recommendedCount.count >= 3) {
        return NextResponse.json({ 
          error: 'Maximum of 3 recommended products allowed' 
        }, { status: 400 });
      }
    }

    await db.run(
      `UPDATE products 
       SET isRecommended = ?, isMostRecommended = ?, recommendationOrder = ?, updatedAt = ?
       WHERE id = ?`,
      [isRecommended ? 1 : 0, isMostRecommended ? 1 : 0, recommendationOrder, new Date().toISOString(), productId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update recommendations:', error);
    return NextResponse.json({ error: 'Failed to update recommendations' }, { status: 500 });
  }
}