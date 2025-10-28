// Add these imports if not already present
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
    const products = await db.all('SELECT * FROM products ORDER BY isMostRecommended DESC, recommendationOrder ASC, createdAt DESC');
    
    const productsWithImages = products.map((product: any) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      isRecommended: Boolean(product.isRecommended),
      isMostRecommended: Boolean(product.isMostRecommended)
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
    
    const { uploadedImages, formData } = await handleFileUploadAndFormData(request);
    
    // Handle recommendation logic
    const isRecommended = formData.isRecommended === 'true';
    const isMostRecommended = formData.isMostRecommended === 'true';
    let recommendationOrder = parseInt(formData.recommendationOrder as string) || 0;

    // Validate recommendations
    if (isMostRecommended) {
      // Check if there's already a most recommended product
      const existingMostRecommended = await db.get(
        'SELECT id FROM products WHERE isMostRecommended = 1 AND id != ?', 
        [formData.id]
      );
      if (existingMostRecommended) {
        return NextResponse.json({ 
          error: 'There can only be one most recommended product' 
        }, { status: 400 });
      }
      recommendationOrder = 0; // Most recommended should be first
    }

    if (isRecommended && !isMostRecommended) {
      // Check if we've reached the limit of 3 recommended products
      const recommendedCount = await db.get(
        'SELECT COUNT(*) as count FROM products WHERE isRecommended = 1 AND isMostRecommended = 0 AND id != ?',
        [formData.id]
      );
      if (recommendedCount.count >= 3) {
        return NextResponse.json({ 
          error: 'Maximum of 3 recommended products allowed' 
        }, { status: 400 });
      }
    }

    const product = {
      id: uuidv4(),
      name: formData.name as string,
      shortDescription: formData.shortDescription as string || null,
      originalPrice: parseFloat(formData.originalPrice as string),
      discountedPrice: parseFloat(formData.discountedPrice as string),
      images: JSON.stringify(uploadedImages),
      isRecommended: isRecommended ? 1 : 0,
      isMostRecommended: isMostRecommended ? 1 : 0,
      recommendationOrder: recommendationOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.run(
      `INSERT INTO products (id, name, shortDescription, originalPrice, discountedPrice, images, isRecommended, isMostRecommended, recommendationOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      Object.values(product)
    );

    return NextResponse.json({ 
      success: true, 
      product: { 
        ...product, 
        images: JSON.parse(product.images),
        isRecommended: Boolean(product.isRecommended),
        isMostRecommended: Boolean(product.isMostRecommended)
      } 
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
    
    const { uploadedImages, formData } = await handleFileUploadAndFormData(request);
    const productId = formData.id as string;
    
    // Get existing product
    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
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
      const filteredImages = allImages.filter(img => !imagesToDelete.includes(img));
      
      for (const imagePath of imagesToDelete) {
        await deleteUploadedFile(imagePath);
      }
      
      allImages.length = 0;
      allImages.push(...filteredImages);
    }

    // Handle recommendation logic
    const isRecommended = formData.isRecommended === 'true';
    const isMostRecommended = formData.isMostRecommended === 'true';
    let recommendationOrder = parseInt(formData.recommendationOrder as string) || 0;

    // Validate recommendations
    if (isMostRecommended) {
      // Check if there's already a most recommended product (excluding current product)
      const existingMostRecommended = await db.get(
        'SELECT id FROM products WHERE isMostRecommended = 1 AND id != ?', 
        [productId]
      );
      if (existingMostRecommended) {
        return NextResponse.json({ 
          error: 'There can only be one most recommended product' 
        }, { status: 400 });
      }
      recommendationOrder = 0; // Most recommended should be first
    }

    if (isRecommended && !isMostRecommended) {
      // Check if we've reached the limit of 3 recommended products (excluding current product)
      const recommendedCount = await db.get(
        'SELECT COUNT(*) as count FROM products WHERE isRecommended = 1 AND isMostRecommended = 0 AND id != ?',
        [productId]
      );
      if (recommendedCount.count >= 3) {
        return NextResponse.json({ 
          error: 'Maximum of 3 recommended products allowed' 
        }, { status: 400 });
      }
    }

    // If product is no longer recommended, reset order
    if (!isRecommended && !isMostRecommended) {
      recommendationOrder = 0;
    }
    
    const product = {
      name: formData.name as string,
      shortDescription: formData.shortDescription as string || null,
      originalPrice: parseFloat(formData.originalPrice as string),
      discountedPrice: parseFloat(formData.discountedPrice as string),
      images: JSON.stringify(allImages),
      isRecommended: isRecommended ? 1 : 0,
      isMostRecommended: isMostRecommended ? 1 : 0,
      recommendationOrder: recommendationOrder,
      updatedAt: new Date().toISOString(),
      id: productId
    };
    
    await db.run(
      `UPDATE products 
       SET name = ?, shortDescription = ?, originalPrice = ?, discountedPrice = ?, images = ?, 
           isRecommended = ?, isMostRecommended = ?, recommendationOrder = ?, updatedAt = ?
       WHERE id = ?`,
      Object.values(product)
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}