// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../../lib/auth';
import { query } from '../../../../../lib/neon';
import { deleteUploadedFile } from '../../../../../lib/upload';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Await the params first
    const { id } = await context.params;
    
    // First, get the product to retrieve image URLs for cleanup
    const existingProduct = await query(
      'SELECT images FROM products WHERE id = $1',
      [id]
    );
    
    if (existingProduct.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete uploaded images from storage
    const images = existingProduct.rows[0].images || [];
    for (const imageUrl of images) {
      await deleteUploadedFile(imageUrl);
    }

    // Delete the product from database
    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}