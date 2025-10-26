import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { verifyUserSession } from '../../../../../lib/auth-user';

function getCartId(request: NextRequest) {
  return request.cookies.get('cartId')?.value;
}

// In your orders API route
export async function POST(request: NextRequest) {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress } = await request.json();

    const db = await getDB();

    // Get cart ID using the same logic as cart API
    const token = request.cookies.get('userToken')?.value;
    let cartId: string | undefined;
    let userId: string;
    let userEmail: string;
    let userName: string;

    if (token) {
      // User is logged in
      const user = await verifyUserSession(token);
      if (user) {
        userId = user.id;
        userEmail = user.email;
        userName = user.name;
        cartId = `user_${token.substring(0, 8)}`;
      } else {
        // Session invalid, treat as guest
        cartId = request.cookies.get('cartId')?.value;
        if (!cartId) {
          return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }
        userId = uuidv4();
        userEmail = customerEmail || `${customerPhone}@guest.com`;
        userName = customerName;
      }
    } else {
      // Guest user
      cartId = request.cookies.get('cartId')?.value;
      if (!cartId) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
      }
      userId = uuidv4();
      userEmail = customerEmail || `${customerPhone}@guest.com`;
      userName = customerName;
    }

    console.log('Looking for cart with ID:', cartId);

    // Get cart items - handle both user ID and cart ID lookup
    let cartItems;
    if (token) {
      // For authenticated users, check by user ID first, then fallback to cart ID
      const user = await verifyUserSession(token);
      if (user) {
        cartItems = await db.all(`
          SELECT ci.*, p.name, p.discountedPrice as price, p.originalPrice
          FROM cart_items ci
          JOIN products p ON ci.productId = p.id
          WHERE ci.userId = ? OR ci.cartId = ?
        `, [user.id, cartId]);
      } else {
        cartItems = await db.all(`
          SELECT ci.*, p.name, p.discountedPrice as price, p.originalPrice
          FROM cart_items ci
          JOIN products p ON ci.productId = p.id
          WHERE ci.cartId = ?
        `, [cartId]);
      }
    } else {
      // For guests, only check by cart ID
      cartItems = await db.all(`
        SELECT ci.*, p.name, p.discountedPrice as price, p.originalPrice
        FROM cart_items ci
        JOIN products p ON ci.productId = p.id
        WHERE ci.cartId = ?
      `, [cartId]);
    }

    console.log('Found cart items:', cartItems.length);

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate total
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% VAT for UAE
    const total = subtotal + tax;

    // Create or get user
    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!existingUser) {
      await db.run(
        'INSERT INTO users (id, email, name, createdAt) VALUES (?, ?, ?, ?)',
        [userId, userEmail, userName, new Date().toISOString()]
      );
    } else {
      // Update user details if they exist
      await db.run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [customerName, userEmail, userId]
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

    // Create order details with shipping information
    await db.run(
      `INSERT INTO order_details (id, orderId, customerName, customerPhone, shippingAddress, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), orderId, customerName, customerPhone, shippingAddress, 'pending', new Date().toISOString()]
    );

    // Clear cart - handle both user ID and cart ID
    if (token) {
      const user = await verifyUserSession(token);
      if (user) {
        await db.run('DELETE FROM cart_items WHERE userId = ? OR cartId = ?', [user.id, cartId]);
      } else {
        await db.run('DELETE FROM cart_items WHERE cartId = ?', [cartId]);
      }
    } else {
      await db.run('DELETE FROM cart_items WHERE cartId = ?', [cartId]);
    }

    const response = NextResponse.json({
      success: true,
      orderId,
      total: parseFloat(total.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2))
    });

    // Clear cart cookie for guest users
    if (!token) {
      response.cookies.delete('cartId');
    }

    return response;
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const token = request.cookies.get('userToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyUserSession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const db = await getDB();

    // Get orders for the authenticated user only
    const orders = await db.all(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.createdAt,
        od.customerName,
        od.customerPhone,
        od.shippingAddress,
        json_group_array(
          json_object(
            'id', oi.id,
            'productId', oi.productId,
            'productName', p.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'images', p.images
          )
        ) as items
      FROM orders o
      JOIN order_details od ON o.id = od.orderId
      JOIN order_items oi ON o.id = oi.orderId
      JOIN products p ON oi.productId = p.id
      WHERE o.userId = ?
      GROUP BY o.id
      ORDER BY o.createdAt DESC
    `, [user.id]);

    const ordersWithParsedItems = orders.map(order => ({
      id: order.id,
      total: parseFloat(order.total),
      status: order.status,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      items: order.items ? JSON.parse(order.items).map((item: any) => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : []
      })) : []
    }));

    return NextResponse.json(ordersWithParsedItems);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}