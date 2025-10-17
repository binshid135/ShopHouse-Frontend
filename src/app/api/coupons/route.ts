// app/api/coupons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './../../../../lib/auth';
import { getDB } from './../../../../lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const db = await getDB();
    const coupons = await db.all('SELECT * FROM coupons ORDER BY createdAt DESC');
    
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const db = await getDB();
    const data = await request.json();
    
    const coupon = {
      id: uuidv4(),
      code: data.code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount || null,
      maxDiscount: data.maxDiscount || null,
      validFrom: new Date(data.validFrom).toISOString(),
      validUntil: new Date(data.validUntil).toISOString(),
      usageLimit: data.usageLimit || null,
      usedCount: 0,
      isActive: true
    };
    
    await db.run(
      `INSERT INTO coupons (id, code, discountType, discountValue, minOrderAmount, maxDiscount, validFrom, validUntil, usageLimit, usedCount, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      Object.values(coupon)
    );
    
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}