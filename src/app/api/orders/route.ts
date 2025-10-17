// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './../../../../lib/auth';
import { getDB } from './../../../../lib/database';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const db = await getDB();
    const orders = await db.all(`
      SELECT o.*, u.name as userName, u.email as userEmail
      FROM orders o
      LEFT JOIN users u ON o.userId = u.id
      ORDER BY o.createdAt DESC
    `);
    
    for (let order of orders) {
      const items = await db.all(`
        SELECT oi.*, p.name as productName, p.images as productImages
        FROM order_items oi
        LEFT JOIN products p ON oi.productId = p.id
        WHERE oi.orderId = ?
      `, [order.id]);
      
      order.items = items.map((item: any) => ({
        ...item,
        productImages: item.productImages ? JSON.parse(item.productImages) : []
      }));
    }
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const db = await getDB();
    const { orderId, status } = await request.json();
    
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}