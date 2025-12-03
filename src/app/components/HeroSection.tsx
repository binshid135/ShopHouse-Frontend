import React from 'react';
import { ShoppingCart, Star, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Product } from '../page';
import { useRouter } from "next/navigation";

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

const HeroContent: React.FC<HeroContentProps> = ({ mostRecommendedProduct }) => {
  const router = useRouter();

  const handleOrderNow = () => {
    router.push("/products");
  };

  return (
    <div className="space-y-6">
      {/* Location Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
        <MapPin className="w-4 h-4 text-orange-600" />
        <span className="text-amber-800 font-medium">
          Al Ain's Kitchen Equipment Supplier
        </span>
      </div>

      <h1 className="text-5xl md:text-6xl font-bold leading-tight">
        Equip Your <span className="text-orange-600">Kitchen</span> And <span className="text-orange-600">House</span>
        <br /> Before your service 
        {/* <span className="text-amber-700">Premium Restaurant Equipment</span> */}
      </h1>

      <p className="text-lg text-amber-800 max-w-md">
        Boost your kitchen efficiency with the best commercial kitchen equipment 
        and household supplies in Al Ain. Your trusted partner for professional 
        kitchen solutions across UAE.
      </p>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleOrderNow}
          className="bg-gradient-to-r cursor-pointer from-orange-500 to-amber-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          View our products
          <ShoppingCart className="w-4 h-4" />
        </button>
        
        <button
          onClick={() =>  window.open('tel:+971507191804')}
          className="bg-white cursor-pointer text-amber-800 border-2 border-amber-300 px-6 py-3 rounded-full font-medium hover:bg-amber-50 transition-all flex items-center gap-2"
        >
          Contact Our Store
        </button>
      </div>

      {/* SEO Keywords */}
      <div className="pt-6 border-t border-amber-200 mt-6">
        <p className="text-sm text-amber-600 mb-2">Popular Searches:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Kitchen Equipment Al Ain",
            "Restaurant Supplies Al Ain",
            "Commercial Cooking Equipment",
            "Hotel Kitchen Al Ain"
          ].map((keyword, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

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
            <p className="text-lg font-semibold">Featured Kitchen Equipment</p>
            <p className="text-sm mt-2">Al Ain's Best Deals Coming Soon</p>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage =
    mostRecommendedProduct.originalPrice > 0
      ? Math.round(
          ((mostRecommendedProduct.originalPrice - mostRecommendedProduct.discountedPrice) /
            mostRecommendedProduct.originalPrice) *
            100
        )
      : 0;

  const handleClick = () => {
    onProductClick(mostRecommendedProduct.id);
  };

  return (
    <div className="relative group" style={{ zIndex: 1 }}>
      {/* Product Location Context */}
      <div className="text-center mb-4">
        <p className="text-amber-700 font-medium">
          Featured Kitchen Equipment in Al Ain
        </p>
      </div>

      <div
        className="relative bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 rounded-full 
        w-full aspect-square flex items-center justify-center shadow-xl p-8 cursor-pointer 
        transform hover:scale-105 transition-transform duration-300"
        onClick={handleClick}
        style={{ zIndex: 1 }}
      >
        {/* Product Name Tag - Reduced z-index */}
        <div className="
          absolute -top-3 right-4 md:right-8 
          bg-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg z-10
        ">
          <span className="text-xs md:text-sm font-semibold text-amber-900">
            {mostRecommendedProduct.name}
          </span>
        </div>

        {/* Best Seller & Mega Deal Tags - Reduced z-index */}
        <div className="
          absolute flex flex-col gap-1 md:gap-2 
          top-4 left-3 md:top-6 md:left-6 z-10
        ">
          <span
            className="
              bg-yellow-400 text-white font-bold 
              text-[10px] md:text-sm px-2 py-1 md:px-4 md:py-2 rounded-full shadow-lg
              transform rotate-[-8deg] md:rotate-[-15deg]
              border border-yellow-300 drop-shadow-md
            "
          >
            ⭐ Al Ain Best Seller
          </span>

          <span
            className="
              bg-red-500 text-white font-bold 
              text-[10px] md:text-sm px-2 py-1 md:px-4 md:py-2 rounded-full shadow-lg
              transform rotate-[6deg] md:rotate-[10deg]
              border border-red-400 drop-shadow-md
            "
          >
            🔥 UAE Mega Deal
          </span>
        </div>

        {/* Product Image */}
        <div className="relative w-4/5 h-4/5 flex items-center justify-center">
          {mostRecommendedProduct.images?.length ? (
            <Image
              src={mostRecommendedProduct.images[0]}
              alt={`${mostRecommendedProduct.name} - Kitchen Equipment Al Ain`}
              fill
              sizes="(max-width: 768px) 80vw, 40vw"
              className="object-contain rounded-full"
              priority
            />
          ) : (
            <div className="w-full h-full bg-orange-200 rounded-full flex items-center justify-center">
              <span className="text-6xl">🍳</span>
            </div>
          )}
        </div>

        {/* Price - Reduced z-index */}
        <div className="
          absolute -bottom-4 left-1/2 transform -translate-x-1/2 
          bg-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-10
        ">
          {mostRecommendedProduct.originalPrice > mostRecommendedProduct.discountedPrice && (
            <span className="text-sm text-gray-500 line-through">
              AED {mostRecommendedProduct.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-2xl font-bold text-amber-900">
            AED {mostRecommendedProduct.discountedPrice.toFixed(2)}
          </span>

          {discountPercentage > 0 && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Rating - Reduced z-index */}
        <div className="
          absolute top-4 right-3 md:top-8 md:right-4 
          bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-lg 
          flex items-center gap-1.5 md:gap-2 z-10
        ">
          <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-amber-900 text-sm md:text-base">4.9</span>
        </div>

        {/* Location Badge */}
        <div className="
          absolute bottom-8 left-6 bg-amber-600 text-white px-3 py-1 
          rounded-lg text-xs opacity-90 flex items-center gap-1
        ">
          <MapPin className="w-3 h-3" />
          <span>Available in Al Ain</span>
        </div>

        {/* Click Hint - Reduced z-index */}
        <div className="
          absolute bottom-8 right-6 bg-black/70 text-white px-3 py-2 
          rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10
        ">
          View Kitchen Equipment Details
        </div>
      </div>

      {/* SEO Text Below Product */}
      <div className="text-center mt-6">
        <p className="text-sm text-amber-600">
          Shop premium kitchen equipment and restaurant supplies in Al Ain. 
          Best deals on commercial cooking tools and professional kitchen appliances.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;