import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import { Product } from '../page';

interface HeroSectionProps {
  mostRecommendedProduct?: Product;
  onProductClick: (productId: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ mostRecommendedProduct, onProductClick }) => {
  return (
    <section className="relative px-6 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <HeroContent mostRecommendedProduct={mostRecommendedProduct} />
          <FeaturedProduct 
            mostRecommendedProduct={mostRecommendedProduct} 
            onProductClick={onProductClick}
          />
        </div>
      </div>
    </section>
  );
};

interface HeroContentProps {
  mostRecommendedProduct?: Product;
}

const HeroContent: React.FC<HeroContentProps> = ({ mostRecommendedProduct }) => (
  <div className="space-y-6">
    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
      Equip your <span className="text-orange-600">kitchen</span>
      <br />
      before your service
    </h1>
    <p className="text-lg text-amber-800 max-w-md">
      Boost your kitchen efficiency and build your culinary excellence with premium equipment every morning
    </p>
    <div className="flex gap-4">
      <button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2">
        Order now
        <ShoppingCart className="w-4 h-4" />
      </button>
      <button className="text-orange-600 font-medium hover:underline">
        More menu
      </button>
    </div>
  </div>
);

interface FeaturedProductProps {
  mostRecommendedProduct?: Product;
  onProductClick: (productId: string) => void;
}

const FeaturedProduct: React.FC<FeaturedProductProps> = ({ mostRecommendedProduct, onProductClick }) => {
  if (!mostRecommendedProduct) {
    return (
      <div className="relative">
        <div className="relative bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 rounded-full w-full aspect-square flex items-center justify-center shadow-xl p-12">
          <div className="text-center text-amber-600">
            <p className="text-lg font-semibold">No featured product</p>
            <p className="text-sm">Add a most recommended product in admin</p>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = mostRecommendedProduct.originalPrice > 0 
    ? Math.round(((mostRecommendedProduct.originalPrice - mostRecommendedProduct.discountedPrice) / mostRecommendedProduct.originalPrice) * 100)
    : 0;

  const handleClick = () => {
    onProductClick(mostRecommendedProduct.id);
  };

  return (
    <div className="relative group">
      <div 
        className="relative bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 rounded-full w-full aspect-square flex items-center justify-center shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-transform duration-300"
        onClick={handleClick}
      >
        {/* Product Tag */}
        <div className="absolute -top-4 right-8 bg-white px-6 py-3 rounded-full shadow-lg">
          <span className="text-sm font-semibold text-amber-900">
            {mostRecommendedProduct.name}
          </span>
        </div>
        
        {/* Product Image Container */}
        <div className="relative w-4/5 h-4/5 flex items-center justify-center">
          {mostRecommendedProduct.images && mostRecommendedProduct.images.length > 0 ? (
            <Image 
              src={mostRecommendedProduct.images[0]} 
              alt={mostRecommendedProduct.name} 
              fill
              sizes="(max-width: 768px) 80vw, 40vw"
              className="object-contain scale-110" // Scale up the image
              priority
            />
          ) : (
            <div className="w-full h-full bg-orange-200 rounded-full flex items-center justify-center">
              <span className="text-6xl">🍳</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          {mostRecommendedProduct.originalPrice > mostRecommendedProduct.discountedPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${mostRecommendedProduct.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-2xl font-bold text-amber-900">
            ${mostRecommendedProduct.discountedPrice.toFixed(2)}
          </span>
          {discountPercentage > 0 && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="absolute top-8 right-4 bg-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-amber-900">4.9</span>
        </div>

        {/* Click Hint */}
        <div className="absolute bottom-8 right-8 bg-black/70 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Click to view details
        </div>
      </div>
    </div>
  );
};

export default HeroSection;