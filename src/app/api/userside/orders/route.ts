import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../lib/database';
import { v4 as uuidv4 } from 'uuid';

function getCartId(request: NextRequest) {
  return request.cookies.get('cartId')?.value;
}

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

export async function POST(request: NextRequest) {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress } = await request.json();
    const cartId = getCartId(request);
    
    if (!cartId) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    
    const db = await getDB();
    await ensureCartTables(db);
    
    // Get cart items
    const cartItems = await db.all(`
      SELECT ci.*, p.name, p.discountedPrice as price
      FROM cart_items ci
      JOIN products p ON ci.productId = p.id
      WHERE ci.cartId = ?
    `, [cartId]);
    
    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    // Create a temporary user for the order (or find existing one by email)
    let user = await db.get('SELECT id FROM users WHERE email = ?', [customerEmail]);
    let userId: string;
    
    if (user) {
      userId = user.id;
    } else {
      userId = uuidv4();
      await db.run(
        'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
        [userId, customerEmail, customerName]
      );
    }
    
    // Create order
    const orderId = uuidv4();
    await db.run(
      `INSERT INTO orders (id, userId, total, status, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, userId, total, 'pending', new Date().toISOString()]
    );
    
    // Create order items
    for (const item of cartItems) {
      await db.run(
        `INSERT INTO order_items (id, orderId, productId, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), orderId, item.productId, item.quantity, item.price]
      );
    }
    
    // Clear cart
    await db.run('DELETE FROM cart_items WHERE cartId = ?', [cartId]);
    
    const response = NextResponse.json({ 
      success: true, 
      orderId,
      total 
    });
    
    // Clear cart cookie
    response.cookies.delete('cartId');
    
    return response;
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const db = await getDB();
    
    // Find user by email
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return NextResponse.json([]); // No orders found for this email
    }
    
    const orders = await db.all(`
      SELECT o.*, 
             json_group_array(
               json_object(
                 'id', oi.id,
                 'productId', oi.productId,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.orderId
      WHERE o.userId = ?
      GROUP BY o.id
      ORDER BY o.createdAt DESC
    `, [user.id]);
    
    const ordersWithParsedItems = orders.map(order => ({
      ...order,
      items: order.items ? JSON.parse(order.items) : [],
      total: parseFloat(order.total)
    }));
    
    return NextResponse.json(ordersWithParsedItems);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}