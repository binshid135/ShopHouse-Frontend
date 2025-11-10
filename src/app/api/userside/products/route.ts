import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/neon';

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM products 
      ORDER BY is_most_recommended DESC, recommendation_order ASC, created_at DESC
    `);
    
    const productsWithImages = result.rows.map((product: any) => ({
      ...product,
      originalPrice: parseFloat(product.original_price),
      discountedPrice: parseFloat(product.discounted_price),
      stock: parseInt(product.stock),
      isRecommended: Boolean(product.is_recommended),
      isMostRecommended: Boolean(product.is_most_recommended),
      recommendationOrder: parseInt(product.recommendation_order),
      images: Array.isArray(product.images) ? product.images : [],
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
    
    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}