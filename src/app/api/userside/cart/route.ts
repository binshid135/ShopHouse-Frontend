import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { verifyUserSession } from '../../../../../lib/auth-user';

interface TableColumnInfo {
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

// Get cart ID based on user authentication
// In your cart API route
function getCartId(request: NextRequest) {
  const token = request.cookies.get('userToken')?.value;
  
  if (token) {
    // For authenticated users, generate a consistent cart ID based on user ID
    // We'll use the first 8 chars of user ID for consistency
    return `user_${token.substring(0, 8)}`;
  } else {
    // For guests, use session-based cart ID
    const guestCartId = request.cookies.get('cartId')?.value;
    return guestCartId || `guest_${uuidv4()}`;
  }
}

async function ensureCartTables(db: any) {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        cartId TEXT NOT NULL,
        productId TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        userId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products (id)
      );
    `);
    
    // Check if userId column exists, if not add it
    const tableInfo = await db.all(`PRAGMA table_info(cart_items)`);
const columns = tableInfo.map((col: TableColumnInfo) => col.name);    
    if (!columns.includes('userId')) {
      await db.run(`ALTER TABLE cart_items ADD COLUMN userId TEXT`);
    }
  } catch (error) {
    console.error('Error ensuring cart tables:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    const db = await getDB();
    await ensureCartTables(db);
    
    // Get user from session for additional filtering
    const token = request.cookies.get('userToken')?.value;
    let userId: string | null = null;
    
    if (token) {
      const user = await verifyUserSession(token);
      userId = user?.id || null;
    }
    
    let cartItems;
    let query: string;
    let params: any[];

    if (userId) {
      // For authenticated users, get cart by user ID
      query = `
        SELECT ci.*, p.name, p.images, p.discountedPrice as price
        FROM cart_items ci
        JOIN products p ON ci.productId = p.id
        WHERE ci.userId = ?
      `;
      params = [userId];
    } else {
      // For guests, get cart by cartId
      query = `
        SELECT ci.*, p.name, p.images, p.discountedPrice as price
        FROM cart_items ci
        JOIN products p ON ci.productId = p.id
        WHERE ci.cartId = ?
      `;
      params = [cartId];
    }
    
    cartItems = await db.all(query, params);
    
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
    
    // Set cart ID cookie if not exists (for guests)
    if (!request.cookies.get('cartId') && !token) {
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
    
    // Get user from session
    const token = request.cookies.get('userToken')?.value;
    let userId: string | null = null;
    
    if (token) {
      const user = await verifyUserSession(token);
      userId = user?.id || null;
    }
    
    // Check if product exists
    const product = await db.get(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // For authenticated users, always use user ID for queries
    let existingItem;
    if (userId) {
      existingItem = await db.get(
        'SELECT * FROM cart_items WHERE userId = ? AND productId = ?',
        [userId, productId]
      );
    } else {
      existingItem = await db.get(
        'SELECT * FROM cart_items WHERE cartId = ? AND productId = ?',
        [cartId, productId]
      );
    }
    
    if (existingItem) {
      // Update quantity
      const updateQuery = userId 
        ? 'UPDATE cart_items SET quantity = quantity + ? WHERE userId = ? AND productId = ?'
        : 'UPDATE cart_items SET quantity = quantity + ? WHERE cartId = ? AND productId = ?';
      
      const updateParams = userId 
        ? [quantity, userId, productId]
        : [quantity, cartId, productId];
      
      await db.run(updateQuery, updateParams);
    } else {
      // Add new item
      await db.run(
        'INSERT INTO cart_items (id, cartId, productId, quantity, userId) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), cartId, productId, quantity, userId]
      );
    }
    
    const response = NextResponse.json({ success: true });
    
    // Only set cart ID cookie for guests
    if (!request.cookies.get('cartId') && !token) {
      response.cookies.set('cartId', cartId, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }
    
    return response;
  } catch (error: any) {
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
    
    // Get user from session for additional security
    const token = request.cookies.get('userToken')?.value;
    let userId: string | null = null;
    
    if (token) {
      const user = await verifyUserSession(token);
      userId = user?.id || null;
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      if (userId) {
        await db.run(
          'DELETE FROM cart_items WHERE id = ? AND userId = ?',
          [itemId, userId]
        );
      } else {
        await db.run(
          'DELETE FROM cart_items WHERE id = ? AND cartId = ?',
          [itemId, cartId]
        );
      }
    } else {
      // Update quantity
      if (userId) {
        await db.run(
          'UPDATE cart_items SET quantity = ? WHERE id = ? AND userId = ?',
          [quantity, itemId, userId]
        );
      } else {
        await db.run(
          'UPDATE cart_items SET quantity = ? WHERE id = ? AND cartId = ?',
          [quantity, itemId, cartId]
        );
      }
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
    
    // Get user from session for additional security
    const token = request.cookies.get('userToken')?.value;
    let userId: string | null = null;
    
    if (token) {
      const user = await verifyUserSession(token);
      userId = user?.id || null;
    }
    
    if (userId) {
      await db.run(
        'DELETE FROM cart_items WHERE id = ? AND userId = ?',
        [itemId, userId]
      );
    } else {
      await db.run(
        'DELETE FROM cart_items WHERE id = ? AND cartId = ?',
        [itemId, cartId]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}