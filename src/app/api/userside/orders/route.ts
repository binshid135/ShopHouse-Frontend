import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../../../../../lib/database';

function getCartId(request: NextRequest) {
  return request.cookies.get('cartId')?.value;
}

export async function POST(request: NextRequest) {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress } = await request.json();
    const cartId = getCartId(request);
    
    if (!cartId) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    
    const db = await getDB();
    
    // Get cart items with product details
    const cartItems = await db.all(`
      SELECT ci.*, p.name, p.discountedPrice as price, p.originalPrice
      FROM cart_items ci
      JOIN products p ON ci.productId = p.id
      WHERE ci.cartId = ?
    `, [cartId]);
    
    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    
    // Calculate total
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% VAT for UAE
    const total = subtotal + tax;
    
    // Create or find user
    let user = await db.get('SELECT id FROM users WHERE email = ?', [customerEmail || '']);
    let userId: string;
    
    if (user) {
      userId = user.id;
    } else {
      userId = uuidv4();
      await db.run(
        'INSERT INTO users (id, email, name, createdAt) VALUES (?, ?, ?, ?)',
        [userId, customerEmail || `${customerPhone}@customer.com`, customerName, new Date().toISOString()]
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
    
    // Clear cart
    await db.run('DELETE FROM cart_items WHERE cartId = ?', [cartId]);
    
    const response = NextResponse.json({ 
      success: true, 
      orderId,
      total: parseFloat(total.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2))
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
    const phone = searchParams.get('phone');
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    const db = await getDB();
    
    // Find orders by phone number
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
      WHERE od.customerPhone = ?
      GROUP BY o.id
      ORDER BY o.createdAt DESC
    `, [phone]);
    
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