// app/products/page.tsx
import { Metadata } from 'next';
import { query } from '../../../lib/neon';
import ProductsClient from '../components/mains/ProductsClient';
import { unstable_cache } from 'next/cache';

interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  originalPrice: number;
  discountedPrice: number;
  images: string[];
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export const revalidate = 600; // 24 hours

// ---------- RELIABLE CACHED PRODUCTS ----------
const getProductsCached = unstable_cache(
  async () => {
    console.log('🔄 [CACHE] Fresh products fetch from database started');
    
    try {
      // First, get the total count for verification
      const countResult = await query('SELECT COUNT(*) as total FROM products');
      const expectedCount = parseInt(countResult.rows[0]?.total || '0');
      console.log(`📊 [CACHE] Database has ${expectedCount} total products`);

      // Fetch all products with detailed logging
      const result = await query(`
        SELECT * FROM products 
        ORDER BY created_at DESC
      `);

      const actualCount = result.rows.length;
      console.log(`📦 [CACHE] Query returned ${actualCount} products`);

      // Verify data integrity
      if (expectedCount !== actualCount) {
        console.error(`🚨 [CACHE] DATA MISMATCH: Expected ${expectedCount}, got ${actualCount}`);
        
        // Try one more time with a simpler query
        console.log('🔄 [CACHE] Retrying with simple query...');
        const retryResult = await query('SELECT id, name FROM products ORDER BY created_at DESC');
        console.log(`🔄 [CACHE] Retry got ${retryResult.rows.length} products`);
        
        // Use retry data if it matches expected count
        if (retryResult.rows.length === expectedCount) {
          console.log('✅ [CACHE] Retry successful, using retry data');
          const fullProducts = await query('SELECT * FROM products ORDER BY created_at DESC');
          return fullProducts.rows.map((product: any) => mapProduct(product));
        }
      }

      if (actualCount === 0) {
        console.warn('⚠️ [CACHE] No products found in database');
        return [];
      }

      console.log(`✅ [CACHE] Successfully cached ${actualCount} products`);
      
      return result.rows.map((product: any) => mapProduct(product));
      
    } catch (error) {
      console.error('❌ [CACHE] Failed to fetch products:', error);
      
      // Fallback: try direct query without any transformations
      try {
        console.log('🔄 [CACHE] Attempting fallback query...');
        const fallbackResult = await query('SELECT * FROM products ORDER BY created_at DESC');
        console.log(`🔄 [CACHE] Fallback got ${fallbackResult.rows.length} products`);
        return fallbackResult.rows.map((product: any) => mapProduct(product));
      } catch (fallbackError) {
        console.error('❌ [CACHE] Fallback also failed:', fallbackError);
        return [];
      }
    }
  },
  ["products-reliable-v3"], // New cache key to bust old corrupted cache
  { 
    revalidate: 600,
    tags: ['products'] 
  }
);

// Helper function for consistent product mapping
function mapProduct(product: any): Product {
  return {
    id: product.id,
    name: product.name,
    shortDescription: product.short_description,
    originalPrice: parseFloat(product.original_price),
    discountedPrice: parseFloat(product.discounted_price),
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category || 'Uncategorized',
    stock: parseInt(product.stock),
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Premium Kitchen Collection - Professional Cookware & Tools',
    description:
      'Browse our complete collection of professional kitchen tools, cookware, knives, and appliances. Find the perfect tools for your culinary needs.',
    keywords:
      'kitchen collection, cookware, knives, appliances, kitchen tools, professional cookware',
    openGraph: {
      title: 'Premium Kitchen Collection',
      description: 'Browse professional kitchen tools and cookware',
      images: ['/og-products.jpg'],
      type: 'website',
    },
  };
}

export default async function ProductsPage() {
  const products = await getProductsCached();
  
  // Log server-side product count
  console.log(`🏁 [PAGE] Rendering with ${products.length} products`);

  const categories = [
    'All',
    ...new Set(
      products
        .map((p) => p.category)
        .filter(
          (category) =>
            category && category !== 'Uncategorized' && category.trim() !== ''
        )
    ),
  ];

  return (
    <ProductsClient
      initialProducts={products}
      initialCategories={categories}
      cacheVersion="v3"
      serverProductCount={products.length}
    />
  );
}