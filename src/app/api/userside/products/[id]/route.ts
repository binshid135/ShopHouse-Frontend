import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../../lib/database';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 mark params as a Promise
) {
  try {
    const { id } = await context.params; // 👈 await it here

    const db = await getDB();
    const product = await db.get(
      'SELECT * FROM products WHERE id = ?',
      [id]
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
