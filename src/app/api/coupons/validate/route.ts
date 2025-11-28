import { NextRequest, NextResponse } from 'next/server';
import { verifyUserSession } from '../../../../../lib/auth-user';
import { query } from '../../../../../lib/neon';

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal } = await request.json();
    
    if (!code) {
      return NextResponse.json({ valid: false, error: 'Coupon code is required' });
    }

    // Get user information for validation
    const token = request.cookies.get('userToken')?.value;
    let userId: string | null = null;
    let isNewUser = true;

    if (token) {
      const user = await verifyUserSession(token);
      if (user) {
        userId = user.id;
        
        // Check if user has previous orders (to determine if they're a new user)
        const previousOrders = await query(
          'SELECT id FROM orders WHERE user_id = $1 LIMIT 1',
          [user.id]
        );
        isNewUser = previousOrders.rows.length === 0;
      }
    }

    // Find active coupon
    const couponResult = await query(`
      SELECT * FROM coupons 
      WHERE code = $1 
        AND is_active = true 
        AND (valid_from <= NOW() OR valid_from IS NULL)
        AND (valid_until >= NOW() OR valid_until IS NULL)
    `, [code.toUpperCase()]);

    if (couponResult.rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired coupon code' });
    }

    const coupon = couponResult.rows[0];

    // Validate coupon conditions
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' });
    }

    if (coupon.minimum_amount && cartTotal < coupon.minimum_amount) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum order amount of AED ${coupon.minimum_amount} required` 
      });
    }

    if (coupon.for_new_users_only && !isNewUser) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This coupon is for new customers only' 
      });
    }

    if (userId) {
      // Check if user has already used this coupon
      const previousUsage = await query(
        'SELECT id FROM coupon_usage WHERE coupon_id = $1 AND user_id = $2',
        [coupon.id, userId]
      );
      
      if (previousUsage.rows.length > 0) {
        return NextResponse.json({ 
          valid: false, 
          error: 'You have already used this coupon' 
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    
    if (coupon.discount_type === 'percentage') {
      discountAmount = (cartTotal * coupon.discount_value) / 100;
      
      // Apply maximum discount limit if set
      if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
        discountAmount = coupon.maximum_discount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: parseFloat(coupon.discount_value),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        minimumAmount: parseFloat(coupon.minimum_amount || 0),
        maximumDiscount: coupon.maximum_discount ? parseFloat(coupon.maximum_discount) : null,
        forNewUsersOnly: coupon.for_new_users_only
      }
    });

  } catch (error) {
    console.error('Failed to validate coupon:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}