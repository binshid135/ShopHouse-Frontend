import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../../lib/neon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  try {
    // Await the params first
    const { id } = await params;
    
    const orderResult = await query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at as "createdAt",
        od.customer_name as "customerName",
        od.customer_phone as "customerPhone",
        od.shipping_address as "shippingAddress",
        od.status as "deliveryStatus",
        od.delivery_option as "deliveryOption"  // ADD THIS LINE
      FROM orders o
      JOIN order_details od ON o.id = od.order_id
      WHERE o.id = $1
    `, [id]);
    
    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const order = orderResult.rows[0];
    
    const orderItemsResult = await query(`
      SELECT 
        oi.*,
        p.name as "productName",
        p.images,
        p.original_price as "originalPrice"
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);
    
    const orderWithItems = {
      ...order,
      total: parseFloat(order.total),
      deliveryOption: order.deliveryOption || 'delivery', // ADD THIS LINE with default
      items: orderItemsResult.rows.map((item: any) => ({
        ...item,
        price: parseFloat(item.price),
        images: Array.isArray(item.images) ? item.images : [],
        originalPrice: parseFloat(item.originalPrice),
        quantity: parseInt(item.quantity)
      }))
    };
    
    return NextResponse.json(orderWithItems);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}