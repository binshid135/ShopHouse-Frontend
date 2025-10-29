// app/api/userside/cart/migrate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../../lib/database';
import { verifyUserSession } from '../../../../../../lib/auth-user';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { guestCartId } = await request.json();
    console.log('🔄 Starting cart migration for guestCartId:', guestCartId);
    
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
      'SELECT * FROM cart_items WHERE cartId = ? AND (userId IS NULL OR userId != ?)',
      [guestCartId, user.id]
    );

    console.log('🛒 Guest cart items found:', guestCartItems.length);

    if (guestCartItems.length === 0) {
      return NextResponse.json({ success: true, message: 'No items to migrate' });
    }

    // Get user's existing cart items
    const userCartItems = await db.all(
      'SELECT * FROM cart_items WHERE userId = ?',
      [user.id]
    );

    console.log('👤 User existing cart items:', userCartItems.length);

    let migratedCount = 0;
    let mergedCount = 0;

    // Merge logic: for each guest item, check if user already has it
    for (const guestItem of guestCartItems) {
      const existingUserItem = userCartItems.find(
        item => item.productId === guestItem.productId
      );

      if (existingUserItem) {
        // Update quantity if item exists
        console.log(`🔄 Merging product ${guestItem.productId}, adding ${guestItem.quantity} to existing quantity ${existingUserItem.quantity}`);
        await db.run(
          'UPDATE cart_items SET quantity = quantity + ? WHERE id = ? AND userId = ?',
          [guestItem.quantity, existingUserItem.id, user.id]
        );
        mergedCount++;
      } else {
        // Insert new item with user ID - generate NEW UUID for the id
        console.log(`✅ Adding new product ${guestItem.productId} with quantity ${guestItem.quantity}`);
        await db.run(
          'INSERT INTO cart_items (id, cartId, productId, quantity, userId) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), `user_${user.id.substring(0, 8)}`, guestItem.productId, guestItem.quantity, user.id]
        );
        migratedCount++;
      }
    }

    // Delete guest cart items after successful migration
    console.log('🗑️ Deleting guest cart items...');
    const deleteResult = await db.run(
      'DELETE FROM cart_items WHERE cartId = ? AND (userId IS NULL OR userId != ?)',
      [guestCartId, user.id]
    );

    console.log('✅ Migration completed:', {
      migratedCount,
      mergedCount,
      deletedItems: deleteResult.changes
    });

    // Clear guest cart cookie
    const response = NextResponse.json({ 
      success: true, 
      migratedCount,
      mergedCount,
      deletedItems: deleteResult.changes
    });
    
    // Clear the guest cart cookie
    response.cookies.set('cartId', '', {
      maxAge: -1,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('❌ Cart migration error:', error);
    return NextResponse.json({ error: 'Failed to migrate cart' }, { status: 500 });
  }
}