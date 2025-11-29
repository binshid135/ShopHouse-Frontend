import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../../lib/neon';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const couponsResult = await query(`
      SELECT 
        c.*,
        COUNT(cu.id) as used_count
      FROM coupons c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await query('SELECT COUNT(*) FROM coupons');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      coupons: couponsResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    if (!code || !discountType || !discountValue) {
      return NextResponse.json({ error: 'Code, discount type, and discount value are required' }, { status: 400 });
    }

    // Check if code already exists
    const existingCoupon = await query('SELECT id FROM coupons WHERE code = $1', [code.toUpperCase()]);
    if (existingCoupon.rows.length > 0) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const couponId = uuidv4();
    
    await query(
      `INSERT INTO coupons (
        id, code, description, discount_type, discount_value, 
        minimum_amount, maximum_discount, usage_limit, valid_from, 
        valid_until, is_active, for_new_users_only
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        couponId,
        code.toUpperCase(),
        description,
        discountType,
        parseFloat(discountValue),
        minimumAmount ? parseFloat(minimumAmount) : 0,
        maximumDiscount ? parseFloat(maximumDiscount) : null,
        usageLimit || null,
        validFrom ? new Date(validFrom) : new Date(),
        validUntil ? new Date(validUntil) : null,
        isActive !== undefined ? isActive : true,
        forNewUsersOnly || false
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Coupon created successfully',
      couponId 
    });
  } catch (error) {
    console.error('Failed to create coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}