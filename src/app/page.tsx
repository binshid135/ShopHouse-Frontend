"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PopularProducts from './components/PopularProducts';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import FloatingElements from './components/FloatingElements';

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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/userside/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  // Get most recommended product for hero section
  const mostRecommendedProduct = products.find(product => product.isMostRecommended);

  // Get other recommended products (excluding the most recommended) for popular section
  const recommendedProducts = products
    .filter(product => product.isRecommended && !product.isMostRecommended)
    .sort((a, b) => a.recommendationOrder - b.recommendationOrder)
    .slice(0, 3); // Take only first 3

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main>
        <HeroSection 
          mostRecommendedProduct={mostRecommendedProduct} 
          onProductClick={handleProductClick}
        />
        <PopularProducts 
          products={recommendedProducts} 
          onProductClick={handleProductClick}
        />
        <AboutUs />
      </main>
      
      <Footer />
    </div>
  );
}