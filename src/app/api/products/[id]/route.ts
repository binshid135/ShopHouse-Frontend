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
    
    // Check if product exists in orders
    const orderCheck = await query(
      `SELECT COUNT(*) as order_count 
       FROM order_items 
       WHERE product_id = $1`,
      [id]
    );
    
    const orderCount = parseInt(orderCheck.rows[0].order_count);
    if (orderCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete product. It exists in ${orderCount} order(s). Please remove it from all orders first.` 
      }, { status: 400 });
    }
    
    // Check if product exists in cart items
    const cartCheck = await query(
      `SELECT COUNT(*) as cart_count 
       FROM cart_items 
       WHERE product_id = $1`,
      [id]
    );
    
    const cartCount = parseInt(cartCheck.rows[0].cart_count);
    if (cartCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete product. It exists in ${cartCount} user cart(s). Please wait for users to remove it from their carts.` 
      }, { status: 400 });
    }

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
    return NextResponse.json({ 
      error: 'Failed to delete product due to a server error' 
    }, { status: 500 });
  }
}