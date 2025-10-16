"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Star, Heart, Shield, Truck, ArrowLeft } from 'lucide-react';
import FloatingElements from './../../components/FloatingElements';
import Header from './../../components/Header';

interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  rating: number;
  category: string;
  tag: string;
  description: string;
  features: string[];
  inStock: boolean;
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock product data - in real app, fetch by ID
  const product: Product = {
    id: Number(params.id),
    name: 'Professional Chef Knife Set',
    price: '189',
    originalPrice: '229',
    image: '🔪',
    rating: 4.9,
    category: 'Knives & Cutlery',
    tag: 'Sale',
    description: 'Premium 8-piece chef knife set crafted from high-carbon German steel. Perfect balance and razor-sharp edges for professional culinary performance.',
    features: [
      'High-carbon German steel blades',
      'Ergonomic pakkawood handles',
      'Lifetime sharpness guarantee',
      'Dishwasher safe',
      'Includes knife block and sharpening steel'
    ],
    inStock: true
  };

  const relatedProducts: Product[] = [
    {
      id: 2,
      name: 'Chef Knife Sharpener',
      price: '45',
      image: '⚔️',
      rating: 4.5,
      category: 'Accessories',
      tag: 'Essential',
      description: '',
      features: [],
      inStock: true
    },
    {
      id: 3,
      name: 'Cutting Board Set',
      price: '78',
      image: '🥬',
      rating: 4.7,
      category: 'Utensils',
      tag: 'Popular',
      description: '',
      features: [],
      inStock: true
    }
  ];

  const discount = product.originalPrice 
    ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
    : 0;

  const handleAddToCart = () => {
    setIsInCart(true);
    // In real app, add to cart context/state
    setTimeout(() => setIsInCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => {}} />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-amber-900 hover:text-orange-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
      </div>

      {/* Product Details */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="text-9xl text-center mb-6">{product.image}</div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        selectedImage === index ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-medium">
                  {product.tag}
                </span>
                {discount > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                    {discount}% OFF
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-amber-900">{product.name}</h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-amber-900">{product.rating}</span>
                  </div>
                  <span className="text-amber-700">(128 reviews)</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.inStock 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-amber-900">{product.price} K</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">{product.originalPrice} K</span>
                )}
              </div>

              <p className="text-lg text-amber-800 leading-relaxed">{product.description}</p>

              {/* Features */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-amber-900">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-amber-800">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium text-amber-900">Quantity:</span>
                  <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-bold text-amber-900 w-8 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isInCart ? 'Added to Cart!' : 'Add to Cart'}
                  </button>
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-4 rounded-full border-2 transition-all ${
                      isFavorite 
                        ? 'bg-red-50 border-red-200 text-red-500' 
                        : 'bg-white border-amber-200 text-amber-900 hover:border-orange-300'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-6 border-t border-amber-200">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <Truck className="w-4 h-4" />
                  Free Delivery
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <Shield className="w-4 h-4" />
                  2-Year Warranty
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-amber-900 mb-8">You May Also Like</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/products/${relatedProduct.id}`)}
              >
                <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <div className="text-6xl">{relatedProduct.image}</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                      {relatedProduct.category}
                    </span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">
                      {relatedProduct.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-amber-900 mb-2">{relatedProduct.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-amber-900">{relatedProduct.price} K</span>
                    <button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-2 rounded-full hover:shadow-lg transform hover:scale-110 transition-all">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}