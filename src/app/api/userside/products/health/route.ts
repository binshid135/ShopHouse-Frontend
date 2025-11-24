// app/api/userside/products/health/route.ts
import { NextResponse } from 'next/server';
import { query } from '../../../../../../lib/neon';

export async function GET() {
  try {
    const countResult = await query('SELECT COUNT(*) as total FROM products');
    const totalProducts = parseInt(countResult.rows[0].total);
    
    const sampleResult = await query(`
      SELECT id, name, category, stock 
      FROM products 
      ORDER BY created_at DESC 
      LIMIT 3
    `);

    return NextResponse.json({
      status: 'healthy',
      totalProducts,
      sampleProducts: sampleResult.rows,
      cacheKey: 'products-api-v3',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
    //   error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}