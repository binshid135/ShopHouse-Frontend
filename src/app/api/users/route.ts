import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './../../../../lib/auth';
import { query } from './../../../../lib/neon';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}