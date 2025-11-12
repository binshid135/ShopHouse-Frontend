// app/api/products/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../../lib/auth';
import { query } from '../../../../../lib/neon';

export async function PUT(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, isRecommended, isMostRecommended, recommendationOrder } = await request.json();

    // Validation
    if (isMostRecommended) {
      const existingMostRecommended = await query(
        'SELECT id FROM products WHERE is_most_recommended = true AND id != $1', 
        [productId]
      );
      if (existingMostRecommended.rows.length > 0) {
        return NextResponse.json({ 
          error: 'There can only be one most recommended product' 
        }, { status: 400 });
      }
    }

    if (isRecommended && !isMostRecommended) {
      const recommendedCount = await query(
        'SELECT COUNT(*) as count FROM products WHERE is_recommended = true AND is_most_recommended = false AND id != $1',
        [productId]
      );
      if (parseInt(recommendedCount.rows[0].count) >= 3) {
        return NextResponse.json({ 
          error: 'Maximum of 3 recommended products allowed' 
        }, { status: 400 });
      }
      
      // Validate recommendation order
      if (recommendationOrder < 1 || recommendationOrder > 3) {
        return NextResponse.json({ 
          error: 'Recommendation order must be between 1 and 3' 
        }, { status: 400 });
      }
    }

    // Reset recommendation order if not recommended
    const finalRecommendationOrder = (!isRecommended && !isMostRecommended) ? 0 : recommendationOrder;

    await query(
      `UPDATE products 
       SET is_recommended = $1, is_most_recommended = $2, recommendation_order = $3, updated_at = NOW()
       WHERE id = $4`,
      [isRecommended, isMostRecommended, finalRecommendationOrder, productId]
    );

    return NextResponse.json({ 
      success: true,
      message: 'Recommendations updated successfully'
    });
  } catch (error) {
    console.error('Failed to update recommendations:', error);
    return NextResponse.json({ error: 'Failed to update recommendations' }, { status: 500 });
  }
}