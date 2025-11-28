// app/api/userside/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/neon';
import { v4 as uuidv4 } from 'uuid';
import { verifyUserSession } from '../../../../../lib/auth-user';
import { sendNewOrderNotification } from '../../../../../lib/email';

function getCartId(request: NextRequest) {
  return request.cookies.get('cartId')?.value;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      shippingAddress, 
      deliveryOption,
      couponCode 
    } = await request.json();
    
    console.log('Received order data:', {
      customerName,
      customerPhone,
      shippingAddress,
      deliveryOption,
      couponCode
    });

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
    let cartItemsResult;
    if (token) {
      const user = await verifyUserSession(token);
      if (user) {
        cartItemsResult = await query(`
          SELECT ci.*, p.name, p.discounted_price as price, p.original_price as "originalPrice"
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.user_id = $1 OR ci.cart_id = $2
        `, [user.id, cartId]);
      } else {
        cartItemsResult = await query(`
          SELECT ci.*, p.name, p.discounted_price as price, p.original_price as "originalPrice"
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.cart_id = $1
        `, [cartId]);
      }
    } else {
      cartItemsResult = await query(`
        SELECT ci.*, p.name, p.discounted_price as price, p.original_price as "originalPrice"
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `, [cartId]);
    }

    const cartItems = cartItemsResult.rows;
    console.log('Found cart items:', cartItems.length);

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.price) * parseInt(item.quantity)), 0
    );

    // Coupon validation and discount calculation
    let discountAmount = 0;
    let couponId: string | null = null;
    let couponDetails: any = null;

    if (couponCode) {
      try {
        // Validate coupon
        const couponValidationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/userside/coupons/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: couponCode,
            cartTotal: subtotal,
          }),
        });

        const couponData = await couponValidationResponse.json();
        
        if (couponData.valid) {
          discountAmount = couponData.coupon.discountAmount;
          couponId = couponData.coupon.id;
          couponDetails = couponData.coupon;
          console.log('✅ Coupon applied successfully:', {
            code: couponData.coupon.code,
            discountAmount,
            discountType: couponData.coupon.discountType
          });
        } else {
          console.log('❌ Coupon validation failed:', couponData.error);
          // Don't fail the order if coupon is invalid, just proceed without discount
        }
      } catch (couponError) {
        console.error('❌ Coupon validation error:', couponError);
        // Proceed without coupon if there's an error
      }
    }

    const tax = (subtotal - discountAmount) * 0.05; // 5% VAT for UAE on discounted amount
    const total = Math.max(0, subtotal - discountAmount + tax);

    // Create or get user
    const existingUserResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (existingUserResult.rows.length === 0) {
      await query(
        'INSERT INTO users (id, email, name) VALUES ($1, $2, $3)',
        [userId, userEmail, userName]
      );
    } else {
      // Update user details if they exist
      await query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [customerName, userEmail, userId]
      );
    }

    // Create order
    const orderId = uuidv4();
    await query(
      `INSERT INTO orders (id, user_id, total, status, subtotal, tax_amount, discount_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [orderId, userId, total, 'pending', subtotal, tax, discountAmount]
    );

    // Create order items
    for (const item of cartItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Create order details with shipping information INCLUDING DELIVERY OPTION
    await query(
      `INSERT INTO order_details (order_id, customer_name, customer_phone, shipping_address, status, delivery_option)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, customerName, customerPhone, shippingAddress, 'pending', deliveryOption || 'delivery']
    );

    // Record coupon usage if coupon was applied
    if (couponId && discountAmount > 0) {
      try {
        await query(
          `INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount)
           VALUES ($1, $2, $3, $4)`,
          [couponId, userId, orderId, discountAmount]
        );

        // Update coupon usage count
        await query(
          'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
          [couponId]
        );

        console.log('✅ Coupon usage recorded successfully');
      } catch (couponUsageError) {
        console.error('❌ Failed to record coupon usage:', couponUsageError);
        // Don't fail the order if coupon usage recording fails
      }
    }

    // Clear cart - handle both user ID and cart ID
    if (token) {
      const user = await verifyUserSession(token);
      if (user) {
        await query('DELETE FROM cart_items WHERE user_id = $1 OR cart_id = $2', [user.id, cartId]);
      } else {
        await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
      }
    } else {
      await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    }

    const orderSummary = {
      id: orderId,
      total: total,
      subtotal: subtotal,
      discountAmount: discountAmount,
      tax: tax,
      status: 'pending',
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      deliveryOption: deliveryOption || 'delivery',
      itemCount: cartItems.length,
      couponCode: couponCode || null,
      couponDiscount: discountAmount
    };

    // Send email notification to admin only (fire and forget)
    sendNewOrderNotification(orderSummary)
      .then(success => {
        if (success) {
          console.log('📧 New order email notification sent to admin successfully');
        } else {
          console.log('⚠️ Failed to send new order email notification to admin');
        }
      })
      .catch(emailError => {
        console.error('❌ Error sending order notification email to admin:', emailError);
      });

    const response = NextResponse.json({
      success: true,
      orderId,
      total: parseFloat(total.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discountAmount.toFixed(2)),
      deliveryOption: deliveryOption || 'delivery',
      couponApplied: discountAmount > 0,
      couponCode: couponCode || null
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

    // Get orders for the authenticated user only INCLUDING DELIVERY OPTION AND COUPON INFO
    const ordersResult = await query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.subtotal,
        o.tax_amount as "taxAmount",
        o.discount_amount as "discountAmount",
        o.created_at as "createdAt",
        od.customer_name as "customerName",
        od.customer_phone as "customerPhone",
        od.shipping_address as "shippingAddress",
        od.delivery_option as "deliveryOption",
        c.code as "couponCode",
        cu.discount_amount as "couponDiscount"
      FROM orders o
      JOIN order_details od ON o.id = od.order_id
      LEFT JOIN coupon_usage cu ON o.id = cu.order_id
      LEFT JOIN coupons c ON cu.coupon_id = c.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `, [user.id]);

    const orders = ordersResult.rows;

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const itemsResult = await query(`
          SELECT 
            oi.*,
            p.name as "productName",
            p.images
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [order.id]);

        return {
          ...order,
          total: parseFloat(order.total),
          subtotal: parseFloat(order.subtotal || order.total),
          taxAmount: parseFloat(order.taxAmount || 0),
          discountAmount: parseFloat(order.discountAmount || 0),
          deliveryOption: order.deliveryOption || 'delivery', 
          items: itemsResult.rows.map((item: any) => ({
            ...item,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
            images: Array.isArray(item.images) ? item.images : []
          }))
        };
      })
    );

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}