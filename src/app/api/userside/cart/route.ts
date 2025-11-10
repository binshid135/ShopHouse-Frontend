import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/neon';
import { v4 as uuidv4 } from 'uuid';
import { verifyUserSession } from '../../../../../lib/auth-user';

// Get cart ID based on user authentication
function getCartId(request: NextRequest) {
  const token = request.cookies.get('userToken')?.value;
  
  if (token) {
    return `user_${token.substring(0, 8)}`;
  } else {
    const guestCartId = request.cookies.get('cartId')?.value;
    return guestCartId || `guest_${uuidv4()}`;
  }
}

export async function GET(request: NextRequest) {
  try {
    const cartId = getCartId(request);
    
    // Get user from session for additional filtering
    const token = request.cookies.get('userToken')?.value;
    let userId: string | null = null;
    
    if (token) {
      const user = await verifyUserSession(token);
      userId = user?.id || null;
    }
    
    let result;
    let queryText: string;
    let params: any[];

    if (userId) {
      // For authenticated users, get cart by user ID
      queryText = `
        SELECT ci.*, p.name, p.images, p.discounted_price as price
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = $1
      `;
      params = [userId];
    } else {
      // For guests, get cart by cart_id
      queryText = `
        SELECT ci.*, p.name, p.images, p.discounted_price as price
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
      `;
      params = [cartId];
    }
    
    result = await query(queryText, params);
    
    const itemsWithImages = result.rows.map((item: any) => ({
      ...item,
      images: Array.isArray(item.images) ? item.images : [],
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity)
    }));
    
    const total = itemsWithImages.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    
    const response = NextResponse.json({
      cartId,
      items: itemsWithImages,
      total
    });
    
    // Set cart ID cookie if not exists (for guests)
    if (!request.cookies.get('cartId') && !token) {
      response.cookies.set('cartId', cartId, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }
    
    return response;
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity = 1 } = await request.json();
    const cartId = getCartId(request);
    
    // Get user from session
    const token = request.cookies.get('userToken')?.value;
    let userId: string | null = null;
    
    if (token) {
      const user = await verifyUserSession(token);
      userId = user?.id || null;
    }
    
    // Check if product exists and has stock
    const productResult = await query(
      'SELECT id, stock FROM products WHERE id = $1',
      [productId]
    );
    
    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const product = productResult.rows[0];
    
    // Check stock availability
    if (product.stock <= 0) {
      return NextResponse.json({ error: 'This product is out of stock' }, { status: 400 });
    }
    
    // For authenticated users, always use user ID for queries
    let existingItem;
    if (userId) {
      const existingResult = await query(
        'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      existingItem = existingResult.rows[0];
    } else {
      const existingResult = await query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );
      existingItem = existingResult.rows[0];
    }
    
    // Check if adding this item would exceed available stock
    const currentQuantity = existingItem ? parseInt(existingItem.quantity) : 0;
    const newTotalQuantity = currentQuantity + quantity;
    
    if (newTotalQuantity > product.stock) {
      return NextResponse.json({ 
        error: `Only ${product.stock} items available in stock. You already have ${currentQuantity} in cart.` 
      }, { status: 400 });
    }
    
    if (existingItem) {
      // Update quantity
      const updateQuery = userId 
        ? 'UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3'
        : 'UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3';
      
      const updateParams = userId 
        ? [quantity, userId, productId]
        : [quantity, cartId, productId];
      
      await query(updateQuery, updateParams);
    } else {
      // Add new item
      await query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, user_id) VALUES ($1, $2, $3, $4)',
        [cartId, productId, quantity, userId]
      );
    }
    
    const response = NextResponse.json({ success: true });
    
    // Only set cart ID cookie for guests
    if (!request.cookies.get('cartId') && !token) {
      response.cookies.set('cartId', cartId, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }
    
    return response;
  } catch (error: any) {
    console.error('Failed to add to cart:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { itemId, quantity } = await request.json();
    const cartId = getCartId(request);
    
    // Get user from session for additional security
    const token = request.cookies.get('userToken')?.value;
    let userId: string | null = null;
    
    if (token) {
      const user = await verifyUserSession(token);
      userId = user?.id || null;
    }
    
    // Get product info to check stock
    let cartItem;
    if (userId) {
      const cartResult = await query(
        `SELECT ci.*, p.stock 
         FROM cart_items ci 
         JOIN products p ON ci.product_id = p.id 
         WHERE ci.id = $1 AND ci.user_id = $2`,
        [itemId, userId]
      );
      cartItem = cartResult.rows[0];
    } else {
      const cartResult = await query(
        `SELECT ci.*, p.stock 
         FROM cart_items ci 
         JOIN products p ON ci.product_id = p.id 
         WHERE ci.id = $1 AND ci.cart_id = $2`,
        [itemId, cartId]
      );
      cartItem = cartResult.rows[0];
    }
    
    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }
    
    // Check stock availability for the new quantity
    if (quantity > cartItem.stock) {
      return NextResponse.json({ 
        error: `Only ${cartItem.stock} items available in stock` 
      }, { status: 400 });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      if (userId) {
        await query(
          'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
          [itemId, userId]
        );
      } else {
        await query(
          'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2',
          [itemId, cartId]
        );
      }
    } else {
      // Update quantity
      if (userId) {
        await query(
          'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3',
          [quantity, itemId, userId]
        );
      } else {
        await query(
          'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3',
          [quantity, itemId, cartId]
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const cartId = getCartId(request);
    
    // Get user from session for additional security
    const token = request.cookies.get('userToken')?.value;
    let userId: string | null = null;
    
    if (token) {
      const user = await verifyUserSession(token);
      userId = user?.id || null;
    }
    
    if (userId) {
      await query(
        'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
        [itemId, userId]
      );
    } else {
      await query(
        'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2',
        [itemId, cartId]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}