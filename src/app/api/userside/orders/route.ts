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
      customerPhone, 
      shippingAddress, 
      deliveryOption,
      couponCode,
      discountAmount: providedDiscountAmount
    } = await request.json();
    
    console.log('Received order data:', {
      customerName,
      customerPhone,
      shippingAddress,
      deliveryOption,
      couponCode,
      providedDiscountAmount,
      hasCouponCode: !!couponCode
    });

    // Get cart ID
    const token = request.cookies.get('userToken')?.value;
    let cartId: string | undefined;
    let userId: string | null = null;

    if (token) {
      // User is logged in
      const user = await verifyUserSession(token);
      if (user) {
        userId = user.id;
        cartId = `user_${token.substring(0, 8)}`;
        
        // Update user phone if needed
        await query(
          'UPDATE users SET phone = $1 WHERE id = $2',
          [customerPhone, userId]
        );
      } else {
        // Session invalid, treat as guest
        cartId = request.cookies.get('cartId')?.value;
        if (!cartId) {
          return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }
      }
    } else {
      // Guest user
      cartId = request.cookies.get('cartId')?.value;
      if (!cartId) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
      }
    }

    console.log('User type:', userId ? 'Logged in' : 'Guest');
    console.log('Cart ID:', cartId);

    // Get cart items
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
    const originalSubtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.price) * parseInt(item.quantity)), 0
    );

    // Coupon validation - only for logged in users
    let discountAmount = 0;
    let couponId: string | null = null;

    if (couponCode && userId) { // Only for logged in users
      console.log('Processing coupon for logged in user...');
      
      if (providedDiscountAmount && providedDiscountAmount > 0) {
        discountAmount = providedDiscountAmount;
        console.log('✅ Using discount amount from checkout:', discountAmount);
        
        try {
          const couponResult = await query(
            'SELECT * FROM coupons WHERE code = $1 AND is_active = true',
            [couponCode]
          );
          
          if (couponResult.rows.length > 0) {
            couponId = couponResult.rows[0].id;
          }
        } catch (error) {
          console.error('Error fetching coupon details:', error);
        }
      } else {
        try {
          const couponValidationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/coupons/validate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: couponCode,
              cartTotal: originalSubtotal,
            }),
          });

          const couponData = await couponValidationResponse.json();
          
          if (couponData.valid) {
            discountAmount = couponData.coupon.discountAmount;
            couponId = couponData.coupon.id;
            console.log('✅ Coupon validated and applied:', {
              code: couponData.coupon.code,
              discountAmount,
              discountType: couponData.coupon.discountType
            });
          } else {
            console.log('❌ Coupon validation failed:', couponData.error);
          }
        } catch (couponError) {
          console.error('❌ Coupon validation error:', couponError);
        }
      }
    } else if (couponCode && !userId) {
      console.log('⚠️ Guest user tried to use coupon, ignoring...');
    }

    // Calculate final amounts
    const discountedSubtotal = Math.max(0, originalSubtotal - discountAmount);
    const total = discountedSubtotal;

    console.log('Order amounts:', {
      originalSubtotal,
      discountAmount,
      discountedSubtotal,
      total,
      userLoggedIn: !!userId
    });

    // ✅ Create order with user_id as NULL for guests
    const orderId = uuidv4();
    
    await query(
      `INSERT INTO orders (id, user_id, total, status, subtotal, tax_amount, discount_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        orderId, 
        userId, // This will be NULL for guests
        total, 
        'pending', 
        discountedSubtotal, 
        0, 
        discountAmount
      ]
    );

    console.log('✅ Order created:', {
      orderId,
      userId: userId || 'GUEST',
      discountAmount
    });

    // Create order items
    for (const item of cartItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Create order details with customer information
    await query(
      `INSERT INTO order_details (order_id, customer_name, customer_phone, shipping_address, status, delivery_option)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        orderId, 
        customerName, 
        customerPhone, 
        shippingAddress, 
        'pending', 
        deliveryOption || 'delivery'
      ]
    );

    // Record coupon usage only for logged in users
    if (couponId && discountAmount > 0 && userId) {
      try {
        await query(
          `INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount)
           VALUES ($1, $2, $3, $4)`,
          [couponId, userId, orderId, discountAmount]
        );

        await query(
          'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
          [couponId]
        );

        console.log('✅ Coupon usage recorded successfully');
      } catch (couponUsageError) {
        console.error('❌ Failed to record coupon usage:', couponUsageError);
      }
    }

    // Clear cart
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
      subtotal: discountedSubtotal,
      originalSubtotal: originalSubtotal,
      discountAmount: discountAmount,
      tax_amount: 0,
      status: 'pending',
      customerName,
      customerPhone,
      shippingAddress,
      deliveryOption: deliveryOption || 'delivery',
      itemCount: cartItems.length,
      couponCode: couponCode || null,
      couponDiscount: discountAmount,
      userType: userId ? 'Registered User' : 'Guest'
    };

    // Send email notification
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
      subtotal: parseFloat(discountedSubtotal.toFixed(2)),
      originalSubtotal: parseFloat(originalSubtotal.toFixed(2)),
      tax_amount: 0,
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      deliveryOption: deliveryOption || 'delivery',
      couponApplied: discountAmount > 0,
      couponCode: couponCode || null,
      userLoggedIn: !!userId
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

    // Get orders only for the authenticated user
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

    // Get order items
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
          subtotal: parseFloat(order.subtotal),
          taxAmount: 0,
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