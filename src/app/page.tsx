// app/page.tsx
import { Metadata } from 'next';
import { query } from '../../lib/neon';
import HomeClient from './components/mains/HomeClient';
import { unstable_cache } from 'next/cache';

export interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  originalPrice: number;
  discountedPrice: number;
  images: string[];
  isRecommended: boolean;
  isMostRecommended: boolean;
  recommendationOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const revalidate = 86400; // 24h

// ---------- CACHED QUERY ----------
const getHomepageProductsCached = unstable_cache(
  async () => {
    const result = await query(`
      SELECT * FROM products 
      WHERE is_recommended = true OR is_most_recommended = true
      ORDER BY is_most_recommended DESC, recommendation_order ASC, created_at DESC
    `);

    return result.rows.map((product: any) => ({
      id: product.id,
      name: product.name,
      shortDescription: product.short_description,
      originalPrice: parseFloat(product.original_price),
      discountedPrice: parseFloat(product.discounted_price),
      images: Array.isArray(product.images) ? product.images : [],
      isRecommended: Boolean(product.is_recommended),
      isMostRecommended: Boolean(product.is_most_recommended),
      recommendationOrder: parseInt(product.recommendation_order),
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));
  },
  ["products-api-v3"],
  { revalidate: 86400 }
);

// ---------- METADATA ----------
export async function generateMetadata(): Promise<Metadata> {
  const products = await getHomepageProductsCached();
  const mostRecommended = products.find((p) => p.isMostRecommended);

  return {
    title: 'Kitchen and Household Items in Al Ain - Best Deals & Offers | Shop house general trading',
    description:
      'Discover professional-grade kitchen equipment with amazing discounts.',
    keywords: 'kitchen tools, kitchen supplies, cookware, knives, appliances, best restaurant supplies, cooking, baking , shop house general trading',
    openGraph: {
      title: 'Premium Kitchen Tools',
      description:
        'Discover professional-grade kitchen equipment.',
      images: ['/og-image.jpg'],
    },
  };
}

// ---------- PAGE ----------
export default async function HomePage() {
  const products = await getHomepageProductsCached();

  const mostRecommendedProduct = products.find((p) => p.isMostRecommended);
  const recommendedProducts = products
    .filter((p) => p.isRecommended && !p.isMostRecommended)
    .sort((a, b) => a.recommendationOrder - b.recommendationOrder)
    .slice(0, 3);

  return (
    <HomeClient
      initialProducts={products}
      mostRecommendedProduct={mostRecommendedProduct}
      recommendedProducts={recommendedProducts}
    />
  );
}
