import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../../lib/neon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params first
    const { id } = await params;

    const result = await query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = result.rows[0];
    const productWithImages = {
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
    };

    return NextResponse.json(productWithImages);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}