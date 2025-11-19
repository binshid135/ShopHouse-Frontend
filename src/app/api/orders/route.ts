// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './../../../../lib/auth';
import { query } from './../../../../lib/neon';

export async function GET(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('🔄 Fetching orders from Neon database...');
    
    // Enhanced query to include delivery option
    let result;
    try {
      console.log('🔍 Attempting to fetch orders with detailed query...');
      result = await query(`
        SELECT 
          o.id,
          o.total,
          o.status,
          o.created_at as "createdAt",
          od.customer_name as "customerName",
          od.customer_phone as "customerPhone",
          od.shipping_address as "shippingAddress",
          od.status as "deliveryStatus",
          od.delivery_option as "deliveryOption"  -- Add this line
        FROM orders o
        LEFT JOIN order_details od ON o.id = od.order_id
        ORDER BY o.created_at DESC
      `);
      console.log('✅ Detailed query successful, orders found:', result.rows.length);
    } catch (detailedError) {
      console.error('❌ Detailed query failed, trying basic query...', detailedError);
      
      // Fallback to basic query
      result = await query(`
        SELECT 
          id,
          total,
          status,
          created_at as "createdAt"
        FROM orders 
        ORDER BY created_at DESC
      `);
      console.log('✅ Basic query successful, orders found:', result.rows.length);
    }

    // If we have orders, try to get item counts
    let ordersWithCounts = result.rows;
    
    if (result.rows.length > 0) {
      try {
        console.log('🔍 Getting order item counts...');
        const orderIds = result.rows.map((order: any) => order.id);
        
        // Get item counts for each order
        const itemCountsResult = await query(`
          SELECT order_id, COUNT(*) as item_count
          FROM order_items 
          WHERE order_id = ANY($1)
          GROUP BY order_id
        `, [orderIds]);
        
        console.log('✅ Item counts found:', itemCountsResult.rows.length);
        
        // Merge item counts with orders
        const itemCountsMap = new Map();
        itemCountsResult.rows.forEach((row: any) => {
          itemCountsMap.set(row.order_id, parseInt(row.item_count));
        });
        
        ordersWithCounts = result.rows.map((order: any) => ({
          ...order,
          total: parseFloat(order.total),
          itemCount: itemCountsMap.get(order.id) || 0,
          customerName: order.customerName || 'N/A',
          deliveryStatus: order.deliveryStatus || order.status,
          deliveryOption: order.deliveryOption || 'delivery' // Default to delivery
        }));
        
      } catch (countError) {
        console.error('❌ Item count query failed, using basic orders:', countError);
        // Use basic orders without item counts
        ordersWithCounts = result.rows.map((order: any) => ({
          ...order,
          total: parseFloat(order.total),
          itemCount: 0,
          customerName: order.customerName || 'N/A',
          deliveryStatus: order.deliveryStatus || order.status,
          deliveryOption: order.deliveryOption || 'delivery' // Default to delivery
        }));
      }
    } else {
      console.log('📭 No orders found in database');
      ordersWithCounts = [];
    }
    
    console.log('✅ Final orders data:', ordersWithCounts.length, 'orders');
    
    return NextResponse.json(ordersWithCounts);
    
  } catch (error) {
    console.error('❌ Failed to fetch orders:', error);
    
    // Return empty array as fallback
    return NextResponse.json([], { status: 200 });
  }
}