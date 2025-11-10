import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../../lib/neon';
import { verifyUserSession } from '../../../../../../lib/auth-user';

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

    // Get guest cart items
    const guestCartResult = await query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND (user_id IS NULL OR user_id != $2)',
      [guestCartId, user.id]
    );

    console.log('🛒 Guest cart items found:', guestCartResult.rows.length);

    if (guestCartResult.rows.length === 0) {
      return NextResponse.json({ success: true, message: 'No items to migrate' });
    }

    // Get user's existing cart items
    const userCartResult = await query(
      'SELECT * FROM cart_items WHERE user_id = $1',
      [user.id]
    );

    console.log('👤 User existing cart items:', userCartResult.rows.length);

    let migratedCount = 0;
    let mergedCount = 0;

    // Merge logic: for each guest item, check if user already has it
    for (const guestItem of guestCartResult.rows) {
      const existingUserItem = userCartResult.rows.find(
        (item: any) => item.product_id === guestItem.product_id
      );

      if (existingUserItem) {
        // Update quantity if item exists
        console.log(`🔄 Merging product ${guestItem.product_id}, adding ${guestItem.quantity} to existing quantity ${existingUserItem.quantity}`);
        await query(
          'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2 AND user_id = $3',
          [guestItem.quantity, existingUserItem.id, user.id]
        );
        mergedCount++;
      } else {
        // Insert new item with user ID
        console.log(`✅ Adding new product ${guestItem.product_id} with quantity ${guestItem.quantity}`);
        await query(
          'INSERT INTO cart_items (cart_id, product_id, quantity, user_id) VALUES ($1, $2, $3, $4)',
          [`user_${user.id.substring(0, 8)}`, guestItem.product_id, guestItem.quantity, user.id]
        );
        migratedCount++;
      }
    }

    // Delete guest cart items after successful migration
    console.log('🗑️ Deleting guest cart items...');
    const deleteResult = await query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND (user_id IS NULL OR user_id != $2)',
      [guestCartId, user.id]
    );

    console.log('✅ Migration completed:', {
      migratedCount,
      mergedCount,
      deletedItems: deleteResult.rowCount
    });

    // Clear guest cart cookie
    const response = NextResponse.json({ 
      success: true, 
      migratedCount,
      mergedCount,
      deletedItems: deleteResult.rowCount
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