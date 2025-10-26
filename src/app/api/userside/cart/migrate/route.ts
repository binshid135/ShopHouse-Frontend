// app/api/userside/cart/migrate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../../lib/database';
import { verifyUserSession } from '../../../../../../lib/auth-user';

export async function POST(request: NextRequest) {
  try {
    const { guestCartId } = await request.json();
    const token = request.cookies.get('userToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await verifyUserSession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    const db = await getDB();
    
    // 1. Get items from guest cart
    const guestItems = await db.all(
      'SELECT * FROM cart_items WHERE cartId = ?',
      [guestCartId]
    );
    
    if (guestItems.length === 0) {
      return NextResponse.json({ success: true, message: 'No items to migrate' });
    }
    
    console.log(`🔄 Migrating ${guestItems.length} items from guest cart to user account`);
    
    // 2. Create user cart ID
    const userCartId = `user_${user.id.substring(0, 8)}`;
    
    // 3. Migrate each item
    for (const item of guestItems) {
      // Check if user already has this product in cart
      const existingUserItem = await db.get(
        'SELECT * FROM cart_items WHERE cartId = ? AND productId = ?',
        [userCartId, item.productId]
      );
      
      if (existingUserItem) {
        // Update quantity
        await db.run(
          'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
          [item.quantity, existingUserItem.id]
        );
      } else {
        // Insert new item with user cart ID
        await db.run(
          'INSERT INTO cart_items (id, cartId, productId, quantity, userId) VALUES (?, ?, ?, ?, ?)',
          [item.id, userCartId, item.productId, item.quantity, user.id]
        );
      }
    }
    
    // 4. Delete guest cart items
    await db.run('DELETE FROM cart_items WHERE cartId = ?', [guestCartId]);
    
    // 5. Update cookie to user cart ID
    const response = NextResponse.json({ 
      success: true, 
      migratedItems: guestItems.length,
      newCartId: userCartId
    });
    
    response.cookies.set('cartId', userCartId, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('Cart migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}