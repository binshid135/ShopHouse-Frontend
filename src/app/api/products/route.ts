// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './../../../../lib/auth';
import { getDB } from './../../../../lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const db = await getDB();
    const products = await db.all('SELECT * FROM products ORDER BY createdAt DESC');
    
    const productsWithImages = products.map((product: any) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));
    
    return NextResponse.json(productsWithImages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const db = await getDB();
    const data = await request.json();
    
    const product = {
      id: uuidv4(),
      name: data.name,
      shortDescription: data.shortDescription || null,
      originalPrice: data.originalPrice,
      discountedPrice: data.discountedPrice,
      images: JSON.stringify(data.images || []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.run(
      `INSERT INTO products (id, name, shortDescription, originalPrice, discountedPrice, images, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      Object.values(product)
    );
    
    return NextResponse.json({ success: true, product: { ...product, images: JSON.parse(product.images) } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const db = await getDB();
    const data = await request.json();
    
    await db.run(
      `UPDATE products 
       SET name = ?, shortDescription = ?, originalPrice = ?, discountedPrice = ?, images = ?, updatedAt = ?
       WHERE id = ?`,
      [data.name, data.shortDescription, data.originalPrice, data.discountedPrice, 
       JSON.stringify(data.images || []), new Date().toISOString(), data.id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}