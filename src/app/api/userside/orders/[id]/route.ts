import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDB();
    
    const order = await db.get(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.createdAt,
        od.customerName,
        od.customerPhone,
        od.shippingAddress,
        od.status as deliveryStatus
      FROM orders o
      JOIN order_details od ON o.id = od.orderId
      WHERE o.id = ?
    `, [params.id]);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const orderItems = await db.all(`
      SELECT 
        oi.*,
        p.name as productName,
        p.images,
        p.originalPrice
      FROM order_items oi
      JOIN products p ON oi.productId = p.id
      WHERE oi.orderId = ?
    `, [params.id]);
    
    const orderWithItems = {
      ...order,
      total: parseFloat(order.total),
      items: orderItems.map(item => ({
        ...item,
        price: parseFloat(item.price),
        images: item.images ? JSON.parse(item.images) : [],
        originalPrice: parseFloat(item.originalPrice)
      }))
    };
    
    return NextResponse.json(orderWithItems);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}