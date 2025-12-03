import React from 'react';
import { Utensils, Star, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from './../../app/page';

interface PopularProductsProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

const PopularProducts: React.FC<PopularProductsProps> = ({ products, onProductClick }) => {
  console.log(products)
  if (products.length === 0) {
    return (
      <section className="relative px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeader />
          <div className="text-center py-12">
            <Utensils className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-700 mb-2">
              No Recommended Products
            </h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <SectionHeader />
        <ProductGrid products={products} onProductClick={onProductClick} />
      </div>
    </section>
  );
};

const SectionHeader: React.FC = () => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-3">
      <h2 className="text-3xl font-bold text-amber-900">Recommended Products</h2>
      <Utensils className="w-6 h-6 text-orange-500" />
    </div>
    <Link 
      href="/products"
      className="text-amber-700 hover:text-orange-600 underline underline-offset-4 hover:underline-offset-2 transition-all duration-200 font-medium"
    >
      View More
    </Link>
  </div>
);

interface ProductGridProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => (
  <div className="grid md:grid-cols-3 gap-6">
    {products.map((product, index) => (
      <ProductCard 
        key={product.id} 
        product={product} 
        index={index}
        onProductClick={onProductClick}
      />
    ))}
  </div>
);

interface ProductCardProps {
  product: Product;
  index: number;
  onProductClick: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index, onProductClick }) => {
  const discountPercentage = product.originalPrice > 0 
    ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
    : 0;

  const handleClick = () => {
    onProductClick(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
   onProductClick(product.id);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer"
      onClick={handleClick}
    >
      {/* Recommendation Badge */}
      {/* <div className="absolute top-4 left-4 z-10">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          Recommended #{product.recommendationOrder}
        </div>
      </div> */}

      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-orange-50 to-amber-100 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🍳</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="font-bold text-lg text-amber-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
      

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-amber-700">4.8</span>
            </div>
          </div>
          
          <div className="text-right">
            {product.originalPrice > product.discountedPrice && (
              <div className="text-xs text-gray-500 line-through">
                AED {product.originalPrice.toFixed(2)}
              </div>
            )}
            <div className="text-xl font-bold text-amber-900">
              AED {product.discountedPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <button 
          onClick={handleAddToCart}
          className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default PopularProducts;