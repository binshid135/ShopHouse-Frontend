import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../lib/database';
import { v4 as uuidv4 } from 'uuid';

// Get or create cart ID from cookie
function getCartId(request: NextRequest) {
  const cartId = request.cookies.get('cartId')?.value;
  return cartId || uuidv4();
}

// We'll use a temporary cart_items table since it doesn't exist in your schema
async function ensureCartTables(db: any) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cartId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES products (id)
    );
  `);
}

export async function GET(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    const db = await getDB();
    await ensureCartTables(db);
    
    const cartItems = await db.all(`
      SELECT ci.*, p.name, p.images, p.discountedPrice as price
      FROM cart_items ci
      JOIN products p ON ci.productId = p.id
      WHERE ci.cartId = ?
    `, [cartId]);
    
    const itemsWithImages = cartItems.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));
    
    const total = itemsWithImages.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    const response = NextResponse.json({
      cartId,
      items: itemsWithImages,
      total
    });
    
    // Set cart ID cookie if not exists
    if (!request.cookies.get('cartId')) {
      response.cookies.set('cartId', cartId, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }
    
    return response;
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity = 1 } = await request.json();
    const cartId = getCartId(request);
    const db = await getDB();
    await ensureCartTables(db);
    
    // Check if product exists
    const product = await db.get(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Check if item already in cart
    const existingItem = await db.get(
      'SELECT * FROM cart_items WHERE cartId = ? AND productId = ?',
      [cartId, productId]
    );
    
    if (existingItem) {
      // Update quantity
      await db.run(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existingItem.id]
      );
    } else {
      // Add new item
      await db.run(
        'INSERT INTO cart_items (id, cartId, productId, quantity) VALUES (?, ?, ?, ?)',
        [uuidv4(), cartId, productId, quantity]
      );
    }
    
    const response = NextResponse.json({ success: true });
    
    // Set cart ID cookie if not exists
    if (!request.cookies.get('cartId')) {
      response.cookies.set('cartId', cartId, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }
    
    return response;
  } catch (error) {
    console.error('Failed to add to cart:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { itemId, quantity } = await request.json();
    const cartId = getCartId(request);
    const db = await getDB();
    await ensureCartTables(db);
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await db.run(
        'DELETE FROM cart_items WHERE id = ? AND cartId = ?',
        [itemId, cartId]
      );
    } else {
      // Update quantity
      await db.run(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND cartId = ?',
        [quantity, itemId, cartId]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const cartId = getCartId(request);
    const db = await getDB();
    await ensureCartTables(db);
    
    await db.run(
      'DELETE FROM cart_items WHERE id = ? AND cartId = ?',
      [itemId, cartId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}