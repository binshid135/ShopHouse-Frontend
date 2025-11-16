// app/HomeClient.tsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PopularProducts from '../PopularProducts';
import AboutUs from '../AboutUs';
import Footer from '../Footer';
import FloatingElements from '../FloatingElements';
import Header from '../Header';
import HeroSection from '../HeroSection';



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

interface HomeClientProps {
  initialProducts: Product[];
  mostRecommendedProduct?: Product;
  recommendedProducts: Product[];
}

export default function HomeClient({ 
  initialProducts, 
  mostRecommendedProduct, 
  recommendedProducts 
}: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

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