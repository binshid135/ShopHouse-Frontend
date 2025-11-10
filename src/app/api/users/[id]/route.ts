import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../../lib/auth';
import { query } from '../../../../../lib/neon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Get user details
    const userResult = await query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Get user's recent orders
    const ordersResult = await query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at as "createdAt",
        COUNT(oi.id) as "itemCount"
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.total, o.status, o.created_at
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [id]);

    // Get user stats (order count and total spent)
    const statsResult = await query(`
      SELECT 
        COUNT(*) as "orderCount",
        SUM(o.total) as "totalSpent"
      FROM orders o
      WHERE o.user_id = $1
    `, [id]);

    const stats = statsResult.rows[0] || { orderCount: 0, totalSpent: 0 };

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      orderCount: parseInt(stats.orderCount) || 0,
      totalSpent: parseFloat(stats.totalSpent) || 0,
      orders: ordersResult.rows.map(order => ({
        ...order,
        total: parseFloat(order.total)
      }))
    });
  } catch (error) {
    console.error('Failed to fetch user details:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const updates = await request.json();

    // Build update query dynamically
    const allowedFields = ['name', 'email', 'phone', 'address', 'role', 'is_active', 'updated_at'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Map field names from camelCase to snake_case if needed
    const setClause = updateFields.map((field, index) => {
      const dbField = field === 'isActive' ? 'is_active' : 
                     field === 'updatedAt' ? 'updated_at' : field;
      return `${dbField} = $${index + 1}`;
    }).join(', ');

    const values = updateFields.map(field => {
      if (field === 'isActive') return updates[field];
      if (field === 'updatedAt') return new Date().toISOString();
      return updates[field];
    });
    
    values.push(id); // Add id for WHERE clause

    await query(
      `UPDATE users SET ${setClause} WHERE id = $${values.length}`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    console.log('Attempting to delete user:', id);

    // Check if user exists
    const userResult = await query('SELECT * FROM users WHERE id = $1', [id]);
    console.log('User check result:', userResult.rows.length);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has orders (foreign key constraint)
    const ordersResult = await query('SELECT COUNT(*) as order_count FROM orders WHERE user_id = $1', [id]);
    const orderCount = parseInt(ordersResult.rows[0]?.order_count || '0');
    console.log('User order count:', orderCount);

    if (orderCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete user with existing orders. Please reassign or delete orders first.' 
      }, { status: 400 });
    }

    // Delete user
    const deleteResult = await query('DELETE FROM users WHERE id = $1', [id]);
    console.log('Delete result:', deleteResult);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete user - Detailed error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
    
    // Handle foreign key constraint violations
    if (error.code === '23503') { // PostgreSQL foreign key violation
      return NextResponse.json({ 
        error: 'Cannot delete user due to existing related records (orders, etc.). Please delete related records first.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: error.message 
    }, { status: 500 });
  }
}