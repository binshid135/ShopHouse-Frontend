import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from './../../app/page';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  console.log("ppprprprppr",product)
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
      style={{animationDelay: `${index * 0.1}s`}}
    >
      {/* <ProductImage image={product.image} /> */}
      <ProductInfo product={product} />
    </div>
  );
};

interface ProductImageProps {
  image: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ image }) => (
  <div className="relative h-64 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
    <div className="absolute top-4 left-4 flex gap-2">
      <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
      <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
      <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
    </div>
    <div className="text-8xl">{image}</div>
  </div>
);

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => (
  <div className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-bold text-amber-900 mb-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          {/* <span className="text-2xl font-bold text-amber-900">{product.price} K</span> */}
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between">
      {/* <ProductTags category={product.category} tag={product.tag} /> */}
      <AddToCartButton />
    </div>
  </div>
);

interface ProductTagsProps {
  category: string;
  tag: string;
}

const ProductTags: React.FC<ProductTagsProps> = ({ category, tag }) => (
  <div className="flex gap-2">
    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
      {category}
    </span>
    <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-medium">
      {tag}
    </span>
  </div>
);

const AddToCartButton: React.FC = () => (
  <button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-3 rounded-full hover:shadow-lg transform hover:scale-110 transition-all">
    <ShoppingCart className="w-5 h-5" />
  </button>
);

export default ProductCard;