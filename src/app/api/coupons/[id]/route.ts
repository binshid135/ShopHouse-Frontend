import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/neon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const couponResult = await query(`
      SELECT 
        c.*,
        COUNT(cu.id) as used_count,
        json_agg(
          json_build_object(
            'user_name', u.name,
            'user_email', u.email,
            'order_id', cu.order_id,
            'discount_amount', cu.discount_amount,
            'used_at', cu.used_at
          )
        ) as usage_history
      FROM coupons c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      LEFT JOIN users u ON cu.user_id = u.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (couponResult.rows.length === 0) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(couponResult.rows[0]);
  } catch (error) {
    console.error('Failed to fetch coupon:', error);
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive,
      forNewUsersOnly
    } = await request.json();

    // Validate required fields
    if (!discountType || !discountValue) {
      return NextResponse.json({ 
        error: 'Discount type and discount value are required' 
      }, { status: 400 });
    }

    // Parse numeric values safely
    const parsedDiscountValue = parseFloat(discountValue);
    if (isNaN(parsedDiscountValue)) {
      return NextResponse.json({ 
        error: 'Invalid discount value' 
      }, { status: 400 });
    }

    const parsedMinimumAmount = minimumAmount ? parseFloat(minimumAmount) : 0;
    const parsedMaximumDiscount = maximumDiscount ? parseFloat(maximumDiscount) : null;

    await query(
      `UPDATE coupons SET
        code = $1, description = $2, discount_type = $3, discount_value = $4,
        minimum_amount = $5, maximum_discount = $6, usage_limit = $7,
        valid_from = $8, valid_until = $9, is_active = $10, for_new_users_only = $11,
        updated_at = NOW()
      WHERE id = $12`,
      [
        code.toUpperCase(),
        description,
        discountType,
        parsedDiscountValue,
        parsedMinimumAmount,
        parsedMaximumDiscount,
        usageLimit || null,
        validFrom ? new Date(validFrom) : new Date(),
        validUntil ? new Date(validUntil) : null,
        isActive,
        forNewUsersOnly,
        id
      ]
    );

    return NextResponse.json({ success: true, message: 'Coupon updated successfully' });
  } catch (error) {
    console.error('Failed to update coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query('DELETE FROM coupons WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Failed to delete coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}