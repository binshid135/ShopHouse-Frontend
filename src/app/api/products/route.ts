// Add these imports if not already present
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from './../../../../lib/auth';
import { query } from './../../../../lib/neon';
import { handleFileUploadAndFormData, deleteUploadedFile } from './../../../../lib/upload';

// In your GET function, add proper parsing:
export async function GET() {
  const session = await verifyAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const result = await query(`
      SELECT *, 
             id as "id",
             name as "name", 
             short_description as "shortDescription",
             original_price as "originalPrice",
             discounted_price as "discountedPrice",
             stock as "stock",
             category as "category",
             images as "images",
             is_recommended as "isRecommended",
             is_most_recommended as "isMostRecommended",
             recommendation_order as "recommendationOrder",
             created_at as "createdAt",
             updated_at as "updatedAt"
      FROM products 
      ORDER BY is_most_recommended DESC, recommendation_order ASC, created_at DESC
    `);
    
    // Convert string numbers to actual numbers
    const products = result.rows.map((product: any) => ({
      ...product,
      originalPrice: parseFloat(product.originalPrice),
      discountedPrice: parseFloat(product.discountedPrice),
      stock: parseInt(product.stock),
      recommendationOrder: parseInt(product.recommendationOrder),
      isRecommended: Boolean(product.isRecommended),
      isMostRecommended: Boolean(product.isMostRecommended)
    }));
    
    return NextResponse.json(products);
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
    const { uploadedImages, formData } = await handleFileUploadAndFormData(request);
    
    if (uploadedImages.length === 0) {
      return NextResponse.json({ 
        error: 'At least one image is required' 
      }, { status: 400 });
    }
    
    const isRecommended = formData.isRecommended === 'true';
    const isMostRecommended = formData.isMostRecommended === 'true';
    let recommendationOrder = parseInt(formData.recommendationOrder as string) || 0;

    if (isMostRecommended) {
      const existingMostRecommended = await query(
        'SELECT id FROM products WHERE is_most_recommended = true'
      );
      if (existingMostRecommended.rows.length > 0) {
        for (const imageUrl of uploadedImages) {
          await deleteUploadedFile(imageUrl);
        }
        return NextResponse.json({ 
          error: 'There can only be one most recommended product' 
        }, { status: 400 });
      }
      recommendationOrder = 0;
    }

    if (isRecommended && !isMostRecommended) {
      const recommendedCount = await query(
        'SELECT COUNT(*) as count FROM products WHERE is_recommended = true AND is_most_recommended = false'
      );
      if (parseInt(recommendedCount.rows[0].count) >= 3) {
        for (const imageUrl of uploadedImages) {
          await deleteUploadedFile(imageUrl);
        }
        return NextResponse.json({ 
          error: 'Maximum of 3 recommended products allowed' 
        }, { status: 400 });
      }
      
      if (recommendationOrder < 1 || recommendationOrder > 3) {
        for (const imageUrl of uploadedImages) {
          await deleteUploadedFile(imageUrl);
        }
        return NextResponse.json({ 
          error: 'Recommendation order must be between 1 and 3' 
        }, { status: 400 });
      }
    }

    const result = await query(
      `INSERT INTO products (name, short_description, original_price, discounted_price, stock, category, images, is_recommended, is_most_recommended, recommendation_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        formData.name as string,
        formData.shortDescription as string || null,
        parseFloat(formData.originalPrice as string),
        parseFloat(formData.discountedPrice as string),
        parseInt(formData.stock as string) || 0,
        formData.category as string || 'Uncategorized',
        uploadedImages,
        isRecommended,
        isMostRecommended,
        recommendationOrder
      ]
    );

    const product = result.rows[0];

    return NextResponse.json({ 
      success: true, 
      product: {
        ...product,
        shortDescription: product.short_description,
        originalPrice: product.original_price,
        discountedPrice: product.discounted_price,
        isRecommended: product.is_recommended,
        isMostRecommended: product.is_most_recommended,
        recommendationOrder: product.recommendation_order,
        createdAt: product.created_at,
        updatedAt: product.updated_at
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
    const { uploadedImages, formData } = await handleFileUploadAndFormData(request);
    const productId = formData.id as string;
    
    // Validate product exists
    const existingProduct = await query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
    
    if (existingProduct.rows.length === 0) {
      // Clean up any uploaded images if product not found
      for (const imageUrl of uploadedImages) {
        await deleteUploadedFile(imageUrl);
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Start with existing images
    let allImages = [...existingProduct.rows[0].images];
    
    // Handle deleted images
    const deletedImages = formData.deletedImages as string;
    if (deletedImages && deletedImages.trim() !== '') {
      try {
        const imagesToDelete = JSON.parse(deletedImages) as string[];
        console.log('Deleting images:', imagesToDelete);
        
        // Filter out deleted images
        allImages = allImages.filter((img: string) => !imagesToDelete.includes(img));
        
        // Delete the files from storage
        for (const imageUrl of imagesToDelete) {
          try {
            await deleteUploadedFile(imageUrl);
          } catch (deleteError) {
            console.error('Failed to delete image file:', imageUrl, deleteError);
            // Continue with other operations even if file deletion fails
          }
        }
      } catch (parseError) {
        console.error('Error parsing deletedImages:', parseError);
        // If parsing fails, continue without deleting any images
      }
    }

    // Add newly uploaded images
    if (uploadedImages && uploadedImages.length > 0) {
      allImages = [...allImages, ...uploadedImages];
    }

    // Validate we have at least one image
    if (allImages.length === 0) {
      // Clean up any uploaded images since we can't use them
      for (const imageUrl of uploadedImages) {
        await deleteUploadedFile(imageUrl);
      }
      return NextResponse.json({ 
        error: 'At least one image is required' 
      }, { status: 400 });
    }

    // Handle recommendation logic
    const isRecommended = formData.isRecommended === 'true';
    const isMostRecommended = formData.isMostRecommended === 'true';
    let recommendationOrder = parseInt(formData.recommendationOrder as string) || 0;

    if (isMostRecommended) {
      const existingMostRecommended = await query(
        'SELECT id FROM products WHERE is_most_recommended = true AND id != $1',
        [productId]
      );
      if (existingMostRecommended.rows.length > 0) {
        // Clean up uploaded images
        for (const imageUrl of uploadedImages) {
          await deleteUploadedFile(imageUrl);
        }
        return NextResponse.json({ 
          error: 'There can only be one most recommended product' 
        }, { status: 400 });
      }
      recommendationOrder = 0;
    }

    if (isRecommended && !isMostRecommended) {
      const recommendedCount = await query(
        'SELECT COUNT(*) as count FROM products WHERE is_recommended = true AND is_most_recommended = false AND id != $1',
        [productId]
      );
      if (parseInt(recommendedCount.rows[0].count) >= 3) {
        // Clean up uploaded images
        for (const imageUrl of uploadedImages) {
          await deleteUploadedFile(imageUrl);
        }
        return NextResponse.json({ 
          error: 'Maximum of 3 recommended products allowed' 
        }, { status: 400 });
      }
      
      if (recommendationOrder < 1 || recommendationOrder > 3) {
        // Clean up uploaded images
        for (const imageUrl of uploadedImages) {
          await deleteUploadedFile(imageUrl);
        }
        return NextResponse.json({ 
          error: 'Recommendation order must be between 1 and 3' 
        }, { status: 400 });
      }
    }

    if (!isRecommended && !isMostRecommended) {
      recommendationOrder = 0;
    }
    
    // Update the product
    const result = await query(
      `UPDATE products 
       SET name = $1, short_description = $2, original_price = $3, discounted_price = $4, 
           stock = $5, category = $6, images = $7, is_recommended = $8, 
           is_most_recommended = $9, recommendation_order = $10, updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        formData.name as string,
        formData.shortDescription as string || null,
        parseFloat(formData.originalPrice as string),
        parseFloat(formData.discountedPrice as string),
        parseInt(formData.stock as string) || 0,
        formData.category as string || 'Uncategorized',
        allImages,
        isRecommended,
        isMostRecommended,
        recommendationOrder,
        productId
      ]
    );

    const updatedProduct = result.rows[0];
    
    return NextResponse.json({ 
      success: true,
      product: {
        ...updatedProduct,
        shortDescription: updatedProduct.short_description,
        originalPrice: updatedProduct.original_price,
        discountedPrice: updatedProduct.discounted_price,
        isRecommended: updatedProduct.is_recommended,
        isMostRecommended: updatedProduct.is_most_recommended,
        recommendationOrder: updatedProduct.recommendation_order,
        createdAt: updatedProduct.created_at,
        updatedAt: updatedProduct.updated_at
      }
    });
    
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}