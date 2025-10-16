import React from 'react';
import { Utensils } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from './../../app/page';

interface PopularProductsProps {
  products: Product[];
}

const PopularProducts: React.FC<PopularProductsProps> = ({ products }) => {
  return (
    <section className="relative px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <SectionHeader />
        <ProductGrid products={products} />
      </div>
    </section>
  );
};

const SectionHeader: React.FC = () => (
  <div className="flex items-center gap-3 mb-8">
    <h2 className="text-3xl font-bold text-amber-900">Popular Now</h2>
    <Utensils className="w-6 h-6 text-orange-500" />
  </div>
);

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => (
  <div className="grid md:grid-cols-3 gap-6">
    {products.map((product, index) => (
      <ProductCard 
        key={product.id} 
        product={product} 
        index={index} 
      />
    ))}
  </div>
);

export default PopularProducts;