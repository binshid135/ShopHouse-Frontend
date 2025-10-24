import { NextRequest, NextResponse } from 'next/server';
import { getDB } from './../../../../lib/database';
import { verifyAdminSession } from './../../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const db = await getDB();
    
    const orders = await db.all(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.createdAt,
        od.customerName,
        od.customerPhone,
        od.shippingAddress,
        od.status as deliveryStatus,
        COUNT(oi.id) as itemCount
      FROM orders o
      JOIN order_details od ON o.id = od.orderId
      LEFT JOIN order_items oi ON o.id = oi.orderId
      GROUP BY o.id
      ORDER BY o.createdAt DESC
    `);
    
    const ordersWithCount = orders.map(order => ({
      ...order,
      total: parseFloat(order.total),
      itemCount: parseInt(order.itemCount)
    }));
    
    return NextResponse.json(ordersWithCount);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { orderId, status, notes } = await request.json();
    const db = await getDB();
    
    // Update order status
    await db.run(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    
    // Update order details status
    await db.run(
      'UPDATE order_details SET status = ?, updatedAt = ? WHERE orderId = ?',
      [status, new Date().toISOString(), orderId]
    );
    
    // Add to status history
    await db.run(
      'INSERT INTO order_status_history (id, orderId, status, notes, createdAt) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), orderId, status, notes || '', new Date().toISOString()]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
} 