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

export const revalidate = 86400; // 24 hours

// ---------- CACHED PRODUCTS ----------
const getProductsCached = unstable_cache(
  async () => {
    const result = await query(`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `);

    return result.rows.map((product: any) => ({
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
    }));
  },
  ["products-list-cache"],
  { revalidate: 86400 }
);

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
    />
  );
}
