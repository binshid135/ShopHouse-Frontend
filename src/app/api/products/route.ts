// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './../../../../lib/auth';
import { getDB } from './../../../../lib/database';
import { handleFileUploadAndFormData, deleteUploadedFile } from './../../../../lib/upload';
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
    console.error('Failed to fetch products:', error);
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
    
    // Handle file uploads and form data in one go
    const { uploadedImages, formData } = await handleFileUploadAndFormData(request);
    
    const product = {
      id: uuidv4(),
      name: formData.name as string,
      shortDescription: formData.shortDescription as string || null,
      originalPrice: parseFloat(formData.originalPrice as string),
      discountedPrice: parseFloat(formData.discountedPrice as string),
      images: JSON.stringify(uploadedImages),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.run(
      `INSERT INTO products (id, name, shortDescription, originalPrice, discountedPrice, images, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      Object.values(product)
    );
    console.log("successs",product)
    return NextResponse.json({ 
      success: true, 
      product: { ...product, images: JSON.parse(product.images) } 
    });

  } catch (error) {
    console.error('Failed to create product:', error);
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
    
    // Handle file uploads and form data in one go
    const { uploadedImages, formData } = await handleFileUploadAndFormData(request);
    const productId = formData.id as string;
    
    // Get existing product to handle image updates
    const existingProduct = await db.get('SELECT images FROM products WHERE id = ?', [productId]);
    let existingImages: string[] = [];
    
    if (existingProduct?.images) {
      existingImages = JSON.parse(existingProduct.images);
    }
    
    // Combine existing and new images
    const allImages = [...existingImages, ...uploadedImages];
    
    // Handle image deletions
    const deletedImages = formData.deletedImages as string;
    if (deletedImages) {
      const imagesToDelete = JSON.parse(deletedImages) as string[];
      // Remove deleted images
      const filteredImages = allImages.filter(img => !imagesToDelete.includes(img));
      
      // Delete files from server
      for (const imagePath of imagesToDelete) {
        await deleteUploadedFile(imagePath);
      }
      
      // Update images array
      allImages.length = 0;
      allImages.push(...filteredImages);
    }
    
    const product = {
      name: formData.name as string,
      shortDescription: formData.shortDescription as string || null,
      originalPrice: parseFloat(formData.originalPrice as string),
      discountedPrice: parseFloat(formData.discountedPrice as string),
      images: JSON.stringify(allImages),
      updatedAt: new Date().toISOString(),
      id: productId
    };
    
    await db.run(
      `UPDATE products 
       SET name = ?, shortDescription = ?, originalPrice = ?, discountedPrice = ?, images = ?, updatedAt = ?
       WHERE id = ?`,
      Object.values(product)
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}