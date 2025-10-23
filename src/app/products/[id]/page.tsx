"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Star, Heart, Shield, Truck, ArrowLeft } from 'lucide-react';
import FloatingElements from './../../components/FloatingElements';
import Header from './../../components/Header';

interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  originalPrice: number;
  discountedPrice: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
      fetchRelatedProducts();
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/userside/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setError('Product not found');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch('/api/userside/products');
      if (response.ok) {
        const data = await response.json();
        // Get 3 random products as related products
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setRelatedProducts(shuffled.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const response = await fetch('/api/userside/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        setIsInCart(true);
        setTimeout(() => setIsInCart(false), 2000);
      } else {
        alert('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Error adding to cart');
    }
  };

  const getDiscountPercentage = () => {
    if (!product) return 0;
    return Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100);
  };

  const getProductEmoji = (product: Product) => {
    const name = product.name.toLowerCase();
    if (name.includes('knife') || name.includes('cutlery')) return '🔪';
    if (name.includes('blender') || name.includes('processor') || name.includes('appliance')) return '🥤';
    if (name.includes('cookware') || name.includes('pan') || name.includes('pot')) return '🍳';
    if (name.includes('bowl') || name.includes('utensil')) return '🥣';
    if (name.includes('baking') || name.includes('bakeware')) return '🎂';
    if (name.includes('mixer') || name.includes('tool')) return '⚙️';
    if (name.includes('sharpener')) return '⚔️';
    return '🍴';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
        <FloatingElements />
        <Header searchQuery={""} setSearchQuery={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
        <FloatingElements />
        <Header searchQuery={""} setSearchQuery={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl text-amber-800 mb-4">{error || 'Product not found'}</p>
            <button 
              onClick={() => router.push('/products')}
              className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const discount = getDiscountPercentage();
  const productEmoji = getProductEmoji(product);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => {}} />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <button 
          onClick={() => router.push('/products')}
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
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[selectedImage]} 
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-2xl mb-6"
                  />
                ) : (
                  <div className="text-9xl text-center mb-6">{productEmoji}</div>
                )}
                <div className="flex justify-center gap-2">
                  {product.images && product.images.map((_, index) => (
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
                {discount > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                    {discount}% OFF
                  </span>
                )}
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                  In Stock
                </span>
              </div>

              <h1 className="text-4xl font-bold text-amber-900">{product.name}</h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-amber-900">4.8</span>
                  </div>
                  <span className="text-amber-700">(128 reviews)</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-amber-900">
                  ${product.discountedPrice.toFixed(2)}
                </span>
                {product.originalPrice > product.discountedPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {product.shortDescription && (
                <p className="text-lg text-amber-800 leading-relaxed">{product.shortDescription}</p>
              )}

              {/* Features */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-amber-900">Product Details</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-amber-800">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Premium quality materials
                  </li>
                  <li className="flex items-center gap-3 text-amber-800">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Professional grade performance
                  </li>
                  <li className="flex items-center gap-3 text-amber-800">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Durable and long-lasting
                  </li>
                  <li className="flex items-center gap-3 text-amber-800">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Easy to clean and maintain
                  </li>
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
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
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
            {relatedProducts.map((relatedProduct) => {
              const relatedEmoji = getProductEmoji(relatedProduct);
              const relatedDiscount = Math.round(((relatedProduct.originalPrice - relatedProduct.discountedPrice) / relatedProduct.originalPrice) * 100);
              
              return (
                <div
                  key={relatedProduct.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/products/${relatedProduct.id}`)}
                >
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <img 
                        src={relatedProduct.images[0]} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">{relatedEmoji}</div>
                    )}
                    {relatedDiscount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        -{relatedDiscount}%
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-amber-900 mb-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-amber-900">
                          ${relatedProduct.discountedPrice.toFixed(2)}
                        </span>
                        {relatedProduct.originalPrice > relatedProduct.discountedPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${relatedProduct.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart functionality for related products
                        }}
                        className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-2 rounded-full hover:shadow-lg transform hover:scale-110 transition-all"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}