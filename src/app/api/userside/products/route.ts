import { NextResponse } from 'next/server';
import { getDB } from '../../../../../lib/database';

export async function GET() {
  try {
    const db = await getDB();
    const products = await db.all(`
      SELECT * FROM products 
      ORDER BY isMostRecommended DESC, recommendationOrder ASC, createdAt DESC
    `);
    
    const productsWithImages = products.map((product: any) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      isRecommended: Boolean(product.isRecommended),
      isMostRecommended: Boolean(product.isMostRecommended)
    }));
    
    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}