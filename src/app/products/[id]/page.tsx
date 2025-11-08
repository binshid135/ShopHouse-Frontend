"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Star, Heart, Shield, Truck, ArrowLeft, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import FloatingElements from './../../components/FloatingElements';
import Header from './../../components/Header';

interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  originalPrice: number;
  discountedPrice: number;
  images: string[];
  category: string;
  stock: number;
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
  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);
  const [cartError, setCartError] = useState<string | null>(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{[key: string]: number}>({});

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
        
        // Initialize image index for main product
        setCurrentImageIndexes(prev => ({
          ...prev,
          [data.id]: 0
        }));
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
        
        // Initialize image indexes for related products
        const indexes: {[key: string]: number} = {};
        shuffled.slice(0, 3).forEach((product: Product) => {
          indexes[product.id] = 0;
        });
        setCurrentImageIndexes(prev => ({ ...prev, ...indexes }));
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    }
  };

  // Image carousel navigation for main product
  const nextImage = (productId: string) => {
    if (!product) return;
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (productId: string) => {
    if (!product) return;
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // Image carousel navigation for related products
  const nextRelatedImage = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const relatedProduct = relatedProducts.find(p => p.id === productId);
    if (!relatedProduct || relatedProduct.images.length <= 1) return;
    
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: (prev[productId] + 1) % relatedProduct.images.length
    }));
  };

  const prevRelatedImage = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const relatedProduct = relatedProducts.find(p => p.id === productId);
    if (!relatedProduct || relatedProduct.images.length <= 1) return;
    
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: (prev[productId] - 1 + relatedProduct.images.length) % relatedProduct.images.length
    }));
  };

  const handleAddToCart = async (productId: string, quantityToAdd: number = 1, productName?: string) => {
    try {
      setCartError(null); // Clear previous errors
      
      const response = await fetch('/api/userside/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: quantityToAdd,
        }),
      });

      if (response.ok) {
        // Mark as added
        setAddedProductIds((prev) => [...prev, productId]);

        // Auto-remove after 2 seconds
        setTimeout(() => {
          setAddedProductIds((prev) => prev.filter((id) => id !== productId));
        }, 2000);

        return true;
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to add product to cart';
        setCartError(errorMessage);
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
          setCartError(null);
        }, 5000);
        
        return false;
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const errorMessage = 'Error adding to cart. Please try again.';
      setCartError(errorMessage);
      
      setTimeout(() => {
        setCartError(null);
      }, 5000);
      
      return false;
    }
  };

  const handleMainProductAddToCart = async () => {
    if (!product) return;

    // Validate stock before adding to cart
    if (product.stock <= 0) {
      setCartError('This product is currently out of stock');
      setTimeout(() => setCartError(null), 5000);
      return;
    }

    if (quantity > product.stock) {
      setCartError(`Only ${product.stock} items available in stock`);
      setTimeout(() => setCartError(null), 5000);
      return;
    }

    const success = await handleAddToCart(product.id, quantity, product.name);
    if (success) {
      setIsInCart(true);
      setTimeout(() => setIsInCart(false), 2000);
    }
  };

  const handleRelatedProductAddToCart = async (productId: string, event: React.MouseEvent, relatedProduct?: Product) => {
    event.stopPropagation(); // Prevent navigation to product detail
    
    if (relatedProduct) {
      // Validate stock for related product
      if (relatedProduct.stock <= 0) {
        setCartError(`${relatedProduct.name} is out of stock`);
        setTimeout(() => setCartError(null), 5000);
        return;
      }
    }
    
    const success = await handleAddToCart(productId, 1, relatedProduct?.name);
    if (success) {
      // Success feedback is handled by the addedProductIds state
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

  // Get stock status badge
  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          Out of Stock
        </span>
      );
    }
    
    if (stock < 5) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium">
          Only {stock} left
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
        In Stock
      </span>
    );
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'electronics':
      case 'appliances':
        return '⚡';
      case 'cookware':
        return '🍳';
      case 'cutlery':
        return '🔪';
      case 'baking':
        return '🎂';
      case 'utensils':
        return '🥄';
      case 'tools':
        return '🛠️';
      case 'storage':
        return '📦';
      default:
        return '🏷️';
    }
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
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const hasMultipleImages = product.images && product.images.length > 1;

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

      {/* Error Message */}
      {cartError && (
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{cartError}</p>
            <button 
              onClick={() => setCartError(null)}
              className="ml-auto text-red-500 hover:text-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Product Details */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-8 shadow-lg relative group">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img 
                      src={product.images[selectedImage]} 
                      alt={product.name}
                      className="w-full h-96 object-contain rounded-2xl mb-6"
                    />
                    
                    {/* Navigation Arrows for Multiple Images */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={() => prevImage(product.id)}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-amber-900 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => nextImage(product.id)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-amber-900 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    {hasMultipleImages && (
                      <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                        {selectedImage + 1} / {product.images.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-9xl text-center mb-6">{productEmoji}</div>
                )}
                
                {/* Image Dots Indicator */}
                {hasMultipleImages && (
                  <div className="flex justify-center gap-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          selectedImage === index ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {hasMultipleImages && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 bg-white rounded-xl border-2 overflow-hidden transition-all ${
                        selectedImage === index 
                          ? 'border-orange-500 shadow-md' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                {discount > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                    {discount}% OFF
                  </span>
                )}
                {getStockBadge(product.stock)}
                
                {/* Category Badge */}
                {product.category && product.category !== 'Uncategorized' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    <span>{getCategoryIcon(product.category)}</span>
                    {product.category}
                  </span>
                )}
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
                  AED{product.discountedPrice.toFixed(2)}
                </span>
                {product.originalPrice > product.discountedPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    AED{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {product.shortDescription && (
                <p className="text-lg text-amber-800 leading-relaxed">{product.shortDescription}</p>
              )}

              {/* Stock Warning for Low Stock */}
              {isLowStock && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">Low Stock Alert</p>
                      <p className="text-sm text-yellow-700">
                        Only {product.stock} items left. Order soon to avoid disappointment.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Warning for Out of Stock */}
              {isOutOfStock && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">Out of Stock</p>
                      <p className="text-sm text-red-700">
                        This product is currently unavailable. Check back later or browse similar products.
                      </p>
                    </div>
                  </div>
                </div>
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
                  <div className={`flex items-center gap-3 rounded-full px-4 py-2 ${
                    isOutOfStock ? 'bg-gray-100' : 'bg-white'
                  }`}>
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isOutOfStock 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      -
                    </button>
                    <span className={`font-bold w-8 text-center ${
                      isOutOfStock ? 'text-gray-400' : 'text-amber-900'
                    }`}>
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={isOutOfStock || quantity >= product.stock}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isOutOfStock || quantity >= product.stock
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Max quantity warning */}
                  {quantity >= product.stock && product.stock > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      Maximum {product.stock} available
                    </span>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleMainProductAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-4 rounded-full font-medium transform transition-all flex items-center justify-center gap-3 ${
                      isOutOfStock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isInCart
                        ? 'bg-green-500 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-lg hover:-translate-y-1'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isOutOfStock 
                      ? 'Out of Stock' 
                      : isInCart 
                        ? 'Added to Cart!' 
                        : 'Add to Cart'
                    }
                  </button>
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    disabled={isOutOfStock}
                    className={`p-4 rounded-full border-2 transition-all ${
                      isOutOfStock
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : isFavorite 
                          ? 'bg-red-50 border-red-200 text-red-500 hover:border-red-300' 
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
              const isAdded = addedProductIds.includes(relatedProduct.id);
              const isRelatedOutOfStock = relatedProduct.stock <= 0;
              const isRelatedLowStock = relatedProduct.stock > 0 && relatedProduct.stock < 5;
              const currentImageIndex = currentImageIndexes[relatedProduct.id] || 0;
              const hasMultipleRelatedImages = relatedProduct.images && relatedProduct.images.length > 1;
              
              return (
                <div
                  key={relatedProduct.id}
                  className={`bg-white rounded-3xl overflow-hidden shadow-lg transform transition-all duration-300 cursor-pointer ${
                    isRelatedOutOfStock 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:shadow-xl hover:-translate-y-2'
                  }`}
                  onClick={() => !isRelatedOutOfStock && router.push(`/products/${relatedProduct.id}`)}
                >
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative group">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <>
                        <img 
                          src={relatedProduct.images[currentImageIndex]} 
                          alt={relatedProduct.name}
                          className="w-full h-full object-contain"
                        />
                        
                        {/* Navigation Arrows for Related Products */}
                        {hasMultipleRelatedImages && (
                          <>
                            <button
                              onClick={(e) => prevRelatedImage(relatedProduct.id, e)}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-amber-900 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => nextRelatedImage(relatedProduct.id, e)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-amber-900 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        
                        {/* Image Dots Indicator for Related Products */}
                        {hasMultipleRelatedImages && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {relatedProduct.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndexes(prev => ({
                                    ...prev,
                                    [relatedProduct.id]: index
                                  }));
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  index === currentImageIndex
                                    ? 'bg-orange-500'
                                    : 'bg-white/80 hover:bg-white'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Image Counter for Related Products */}
                        {hasMultipleRelatedImages && (
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {currentImageIndex + 1} / {relatedProduct.images.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-6xl">{relatedEmoji}</div>
                    )}
                    
                    {relatedDiscount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        -{relatedDiscount}%
                      </div>
                    )}
                    
                    {/* Stock badge for related products */}
                    {isRelatedOutOfStock && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        Out of Stock
                      </div>
                    )}
                    {isRelatedLowStock && !isRelatedOutOfStock && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        Low Stock
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-amber-900 mb-2">{relatedProduct.name}</h3>
                    {relatedProduct.shortDescription && (
                      <p className="text-amber-700 text-sm mb-3 line-clamp-2">
                        {relatedProduct.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className={`text-xl font-bold ${
                          isRelatedOutOfStock ? 'text-gray-400' : 'text-amber-900'
                        }`}>
                          AED{relatedProduct.discountedPrice.toFixed(2)}
                        </span>
                        {relatedProduct.originalPrice > relatedProduct.discountedPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            AED{relatedProduct.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => handleRelatedProductAddToCart(relatedProduct.id, e, relatedProduct)}
                        disabled={isRelatedOutOfStock}
                        className={`p-3 rounded-full transition-all transform ${
                          isRelatedOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isAdded
                            ? 'bg-green-500 text-white shadow-lg hover:scale-110'
                            : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-lg hover:scale-110'
                        }`}
                      >
                        {isRelatedOutOfStock 
                          ? 'Out of Stock' 
                          : isAdded 
                            ? '✓' 
                            : <ShoppingCart className="w-4 h-4" />
                        }
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