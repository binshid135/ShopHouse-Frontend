// app/api/userside/products/route.ts
import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/neon';
import { unstable_cache } from 'next/cache';

const getProductsCached = unstable_cache(async () => {
  console.log('🔄 [API] Fresh products fetch from database');
  
  try {
    // Get total count for verification
    const countResult = await query('SELECT COUNT(*) as total FROM products');
    const expectedCount = parseInt(countResult.rows[0]?.total || '0');
    console.log(`📊 [API] Database has ${expectedCount} total products`);

    // Fetch all products
    const result = await query(`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `);

    const actualCount = result.rows.length;
    console.log(`📦 [API] Query returned ${actualCount} products`);

    // Verify data integrity
    if (expectedCount !== actualCount) {
      console.error(`🚨 [API] DATA MISMATCH: Expected ${expectedCount}, got ${actualCount}`);
      
      // Try one more time with a simpler query
      console.log('🔄 [API] Retrying with simple query...');
      const retryResult = await query('SELECT id, name FROM products ORDER BY created_at DESC');
      console.log(`🔄 [API] Retry got ${retryResult.rows.length} products`);
      
      // Use retry data if it matches expected count
      if (retryResult.rows.length === expectedCount) {
        console.log('✅ [API] Retry successful, using retry data');
        const fullProducts = await query('SELECT * FROM products ORDER BY created_at DESC');
        return fullProducts.rows.map((product: any) => mapProduct(product));
      }
    }

    if (actualCount === 0) {
      console.warn('⚠️ [API] No products found in database');
      return [];
    }

    console.log(`✅ [API] Successfully fetched ${actualCount} products`);
    
    return result.rows.map((product: any) => mapProduct(product));
    
  } catch (error) {
    console.error('❌ [API] Failed to fetch products:', error);
    
    // Fallback: try direct query without any transformations
    try {
      console.log('🔄 [API] Attempting fallback query...');
      const fallbackResult = await query('SELECT * FROM products ORDER BY created_at DESC');
      console.log(`🔄 [API] Fallback got ${fallbackResult.rows.length} products`);
      return fallbackResult.rows.map((product: any) => mapProduct(product));
    } catch (fallbackError) {
      console.error('❌ [API] Fallback also failed:', fallbackError);
      return [];
    }
  }
}, ["products-api-v3"], { // New cache key to match page
  revalidate: 600, // 24 hours
  tags: ['products'] // Add tags for consistency
});

// Helper function for consistent product mapping
function mapProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    shortDescription: product.short_description,
    originalPrice: parseFloat(product.original_price),
    discountedPrice: parseFloat(product.discounted_price),
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category || 'Uncategorized',
    stock: parseInt(product.stock),
    isRecommended: Boolean(product.is_recommended),
    isMostRecommended: Boolean(product.is_most_recommended),
    recommendationOrder: parseInt(product.recommendation_order),
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };
}

export async function GET() {
  try {
    const products = await getProductsCached();
    
    return NextResponse.json({
      products,
      count: products.length,
      cacheVersion: 'v3',
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      // details: error.message,
      success: false
    }, { status: 500 });
  }
}