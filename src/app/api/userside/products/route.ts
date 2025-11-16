// app/api/userside/products/route.ts
import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/neon';
import { unstable_cache } from 'next/cache';

const getProductsCached = unstable_cache(async () => {
  const result = await query(`
    SELECT * FROM products 
    ORDER BY created_at DESC
  `);

  return result.rows.map((product: any) => ({
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
    updatedAt: product.updated_at
  }));
}, ["products-cache"], {
  revalidate: 86400 // 24 hours
});

export async function GET() {
  try {
    const products = await getProductsCached();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
