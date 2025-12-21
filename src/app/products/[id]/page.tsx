// app/products/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { query } from '../../../../lib/neon';
import ProductDetailClient from '@/app/components/mains/ProductDetailClient';
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

// ---------- CACHED PRODUCT ----------
const getProductCached = (id: string) =>
  unstable_cache(
    async () => {
      const result = await query('SELECT * FROM products WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;

      const product = result.rows[0];
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
    },
    [`product-${id}`],
    { revalidate: 86400 }
  )();

// ---------- CACHED RELATED PRODUCTS ----------
const getRelatedProductsCached = (id: string, category?: string) =>
  unstable_cache(
    async () => {
      let result;

      if (category && category !== 'Uncategorized') {
        result = await query(
          'SELECT * FROM products WHERE category = $1 AND id != $2 ORDER BY created_at DESC LIMIT 3',
          [category, id]
        );
      } else {
        result = await query(
          'SELECT * FROM products WHERE id != $1 ORDER BY created_at DESC LIMIT 3',
          [id]
        );
      }

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
    [`related-${id}-${category ?? 'none'}`],
    { revalidate: 86400 }
  )();

// ---------- STATIC PARAMS ----------
export async function generateStaticParams() {
  const result = await query('SELECT id FROM products LIMIT 50');
  return result.rows.map((p: any) => ({ id: p.id }));
}

// ---------- METADATA ----------
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductCached(params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: `${product.name} - Best ${product.category} sale in Al Ain, UAE`,
    description: product.shortDescription || `Discover ${product.name}.`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || `Discover ${product.name}`,
      images: product.images?.[0] ? [product.images[0]] : ['/og-product.jpg'],
    },
  };
}

// ---------- PAGE ----------
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductCached(params.id);

  if (!product) notFound();

  const relatedProducts = await getRelatedProductsCached(product.id, product.category);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
