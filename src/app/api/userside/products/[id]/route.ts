import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDB();
    const product = await db.get(
      'SELECT * FROM products WHERE id = ?',
      [params.id]
    );
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const productWithImages = {
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    };
    
    return NextResponse.json(productWithImages);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}