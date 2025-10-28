// app/api/userside/cart/migrate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../../lib/database';
import { verifyUserSession } from '../../../../../../lib/auth-user';

export async function POST(request: NextRequest) {
  try {
    const { guestCartId } = await request.json();
    
    // Get user from session
    const token = request.cookies.get('userToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await verifyUserSession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const db = await getDB();

    // Get guest cart items
    const guestCartItems = await db.all(
      'SELECT * FROM cart_items WHERE cartId = ? AND (userId IS NULL OR userId = ?)',
      [guestCartId, user.id]
    );

    if (guestCartItems.length === 0) {
      return NextResponse.json({ success: true, message: 'No items to migrate' });
    }

    // Get user's existing cart items
    const userCartItems = await db.all(
      'SELECT * FROM cart_items WHERE userId = ?',
      [user.id]
    );

    // Merge logic: for each guest item, check if user already has it
    for (const guestItem of guestCartItems) {
      const existingUserItem = userCartItems.find(
        item => item.productId === guestItem.productId
      );

      if (existingUserItem) {
        // Update quantity if item exists
        await db.run(
          'UPDATE cart_items SET quantity = quantity + ? WHERE id = ? AND userId = ?',
          [guestItem.quantity, existingUserItem.id, user.id]
        );
      } else {
        // Insert new item with user ID
        await db.run(
          'INSERT INTO cart_items (id, cartId, productId, quantity, userId) VALUES (?, ?, ?, ?, ?)',
          [guestItem.id, `user_${user.id}`, guestItem.productId, guestItem.quantity, user.id]
        );
      }
    }

    // Delete guest cart items after migration
    await db.run(
      'DELETE FROM cart_items WHERE cartId = ? AND (userId IS NULL OR userId != ?)',
      [guestCartId, user.id]
    );

    // Clear guest cart cookie
    const response = NextResponse.json({ 
      success: true, 
      migratedItems: guestCartItems.length 
    });
    
    response.cookies.delete('cartId');

    return response;

  } catch (error) {
    console.error('Cart migration error:', error);
    return NextResponse.json({ error: 'Failed to migrate cart' }, { status: 500 });
  }
}