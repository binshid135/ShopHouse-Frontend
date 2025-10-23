import { NextResponse } from 'next/server';
import { getDB } from '../../../../../lib/database';

export async function GET() {
  try {
    const db = await getDB();
    const products = await db.all(`
      SELECT * FROM products 
      ORDER BY createdAt DESC
    `);
    
    const productsWithImages = products.map((product: any) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));
    
    return NextResponse.json(productsWithImages);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}