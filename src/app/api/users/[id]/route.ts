import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../../lib/auth';
import { getDB } from '../../../../../lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDB();
    const userId = params.id;

    // Get user details
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's recent orders
    const orders = await db.all(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.createdAt,
        COUNT(oi.id) as itemCount
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.orderId
      WHERE o.userId = ?
      GROUP BY o.id
      ORDER BY o.createdAt DESC
      LIMIT 10
    `, [userId]);

    return NextResponse.json({
      ...user,
      orders: orders.map(order => ({
        ...order,
        total: parseFloat(order.total)
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDB();
    const userId = params.id;
    const updates = await request.json();

    // Build update query dynamically
    const allowedFields = ['name', 'email', 'phone', 'address', 'role', 'isActive', 'updatedAt'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);
    values.push(userId);

    await db.run(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDB();
    const userId = params.id;

    // Check if user exists
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user (you might want to soft delete instead)
    await db.run('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}