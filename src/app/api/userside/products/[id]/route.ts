// app/api/userside/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../../lib/neon';
import { unstable_cache } from 'next/cache';

const getProductCached = (id: string) =>
  unstable_cache(
    async () => {
      const result = await query(
        'SELECT * FROM products WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) return null;

      const product = result.rows[0];

      return {
        id: product.id,
        name: product.name,
        shortDescription: product.short_description,
        originalPrice: parseFloat(product.original_price),
        discountedPrice: parseFloat(product.discounted_price),
        images: Array.isArray(product.images) ? product.images : [],
        category: product.category || 'Uncategorized',
        stock: parseInt(product.stock),
        isRecommended: Boolean(product.is_recommended),
        isMostRecommended: Boolean(product.is_most_recommended),
        recommendationOrder: parseInt(product.recommendation_order),
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      };
    },
    // FIX: stable key must be an array of strings
    [`product-cache-${id}`],
    {
      revalidate: 600,
    }
  )();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await getProductCached(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
