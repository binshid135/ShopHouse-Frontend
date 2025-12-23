"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star, Heart, Shield, Truck, ArrowLeft, AlertCircle, ChevronLeft, ChevronRight,X,CheckCircle } from 'lucide-react';
import FloatingElements from './../../components/FloatingElements';
import Header from './../../components/Header';
import Footer from './../../components/Footer';
import CartToast from './../../components/CartToast';
import { useCart } from '@/app/context/cartContext';
import { viewItemGA } from '../../../../lib/analytics';
import { addToCartGA } from "../../../../lib/analytics";

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

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);
  const [cartError, setCartError] = useState<string | null>(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const indexes: { [key: string]: number } = {};
    relatedProducts.forEach((relatedProduct) => {
      indexes[relatedProduct.id] = 0;
    });
    setCurrentImageIndexes(indexes);

    if (product) {
      viewItemGA(product);
    }
  }, [relatedProducts, product]);

  // Validate quantity on change
  useEffect(() => {
    if (quantity <= 0) {
      setQuantityError('Quantity must be at least 1');
    } else if (quantity > product.stock) {
      setQuantityError(`Only ${product.stock} items available`);
    } else {
      setQuantityError(null);
    }
  }, [quantity, product.stock]);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

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

  const handleAddToCart = async (productId: string, quantityToAdd: number = 1, productName?: string, productPrice?: number) => {
    try {
      setCartError(null);
      setQuantityError(null);

      const targetProduct = productId === product.id ? product : relatedProducts.find(p => p.id === productId);
      if (!targetProduct) return false;

      // Validate quantity
      if (quantityToAdd <= 0) {
        const errorMsg = 'Quantity must be at least 1';
        if (productId === product.id) {
          setQuantityError(errorMsg);
        } else {
          setCartError(errorMsg);
        }
        setTimeout(() => {
          if (productId === product.id) {
            setQuantityError(null);
          } else {
            setCartError(null);
          }
        }, 5000);
        return false;
      }

      if (targetProduct.stock <= 0) {
        const errorMsg = `${targetProduct.name} is currently out of stock`;
        if (productId === product.id) {
          setQuantityError(errorMsg);
        } else {
          setCartError(errorMsg);
        }
        setTimeout(() => {
          if (productId === product.id) {
            setQuantityError(null);
          } else {
            setCartError(null);
          }
        }, 5000);
        return false;
      }

      if (quantityToAdd > targetProduct.stock) {
        const errorMsg = `Only ${targetProduct.stock} items available in stock`;
        if (productId === product.id) {
          setQuantityError(errorMsg);
        } else {
          setCartError(errorMsg);
        }
        setTimeout(() => {
          if (productId === product.id) {
            setQuantityError(null);
          } else {
            setCartError(null);
          }
        }, 5000);
        return false;
      }

      const result = await addToCart(productId, quantityToAdd);

      if (result.success) {
        addToCartGA(productName || targetProduct.name, quantityToAdd);
        setAddedProductIds((prev) => [...prev, productId]);
        setTimeout(() => {
          setAddedProductIds((prev) => prev.filter((id) => id !== productId));
        }, 2000);
        return true;
      } else {
        const errorMsg = result.error || 'Failed to add to cart';
        if (productId === product.id) {
          setQuantityError(errorMsg);
        } else {
          setCartError(errorMsg);
        }
        setTimeout(() => {
          if (productId === product.id) {
            setQuantityError(null);
          } else {
            setCartError(null);
          }
        }, 5000);
        return false;
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const errorMessage = 'Error adding to cart. Please try again.';
      if (productId === product.id) {
        setQuantityError(errorMessage);
      } else {
        setCartError(errorMessage);
      }
      setTimeout(() => {
        if (productId === product.id) {
          setQuantityError(null);
        } else {
          setCartError(null);
        }
      }, 5000);
      return false;
    }
  };

  const handleMainProductAddToCart = async () => {
    // Clear previous errors
    setQuantityError(null);
    setCartError(null);

    // Validate before proceeding
    if (quantity <= 0) {
      setQuantityError('Quantity must be at least 1');
      setTimeout(() => setQuantityError(null), 5000);
      return;
    }

    if (product.stock <= 0) {
      setQuantityError('This product is currently out of stock');
      setTimeout(() => setQuantityError(null), 5000);
      return;
    }

    if (quantity > product.stock) {
      setQuantityError(`Only ${product.stock} items available in stock`);
      setTimeout(() => setQuantityError(null), 5000);
      return;
    }

    const success = await handleAddToCart(
      product.id,
      quantity,
      product.name,
      product.discountedPrice
    );

    if (success) {
      addToCartGA(product.name, quantity);
      setIsInCart(true);
      setShowToast(true); // Show toast
      setTimeout(() => setIsInCart(false), 2000);
      // setTimeout(() => setShowToast(false), 8000); // Auto-hide toast
    }
  };

  const handleRelatedProductAddToCart = async (productId: string, event: React.MouseEvent, relatedProduct?: Product) => {
    event.stopPropagation();
    setCartError(null);

    if (relatedProduct) {
      if (relatedProduct.stock <= 0) {
        setCartError(`${relatedProduct.name} is out of stock`);
        setTimeout(() => setCartError(null), 5000);
        return;
      }
    }

    const success = await handleAddToCart(
      productId,
      1,
      relatedProduct?.name,
      relatedProduct?.discountedPrice
    );

    if (success) {
      setShowToast(true); // Show toast
      // setTimeout(() => setShowToast(false), 8000); // Auto-hide toast
    }
  };

  const getDiscountPercentage = () => {
    return Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100);
  };

  const getProductEmoji = (targetProduct: Product) => {
    const name = targetProduct.name.toLowerCase();
    if (name.includes('knife') || name.includes('cutlery')) return '🔪';
    if (name.includes('blender') || name.includes('processor') || name.includes('appliance')) return '🥤';
    if (name.includes('cookware') || name.includes('pan') || name.includes('pot')) return '🍳';
    if (name.includes('bowl') || name.includes('utensil')) return '🥣';
    if (name.includes('baking') || name.includes('bakeware')) return '🎂';
    if (name.includes('mixer') || name.includes('tool')) return '⚙️';
    if (name.includes('sharpener')) return '⚔️';
    return '🍴';
  };

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

  const discount = getDiscountPercentage();
  const productEmoji = getProductEmoji(product);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => { }} />

      {/* Cart Toast */}
      <CartToast
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        onViewCart={() => router.push('/cart')}
        onContinueShopping={() => {
          const relatedSection = document.querySelector('section[class*="Related"]');
          if (relatedSection) {
            relatedSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <button
          onClick={() => router.push('/products')}
          className="flex items-center gap-2 text-amber-900 hover:text-orange-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
      </div>

      {/* General Error Message (for related products) */}
      {cartError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
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
      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-lg relative group">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-64 sm:h-96 object-contain rounded-2xl mb-6"
                    />

                    {/* Navigation Arrows for Multiple Images */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-amber-900 rounded-full p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-amber-900 rounded-full p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {hasMultipleImages && (
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/50 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                        {selectedImage + 1} / {product.images.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-64 sm:h-96 flex items-center justify-center">
                    <div className="text-6xl sm:text-9xl text-center">{productEmoji}</div>
                  </div>
                )}

                {/* Image Dots Indicator */}
                {hasMultipleImages && (
                  <div className="flex justify-center gap-2 mt-4">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${selectedImage === index ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {hasMultipleImages && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-20 sm:h-20 bg-white rounded-lg sm:rounded-xl border-2 overflow-hidden transition-all ${selectedImage === index
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
              <div className="flex flex-wrap items-center gap-2 mb-4">
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

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-900">{product.name}</h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-amber-900">4.8</span>
                  </div>
                  <span className="text-amber-700 text-sm sm:text-base">(128 reviews)</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-2xl sm:text-3xl font-bold text-amber-900">
                  AED {product.discountedPrice.toFixed(2)}
                </span>
                {product.originalPrice > product.discountedPrice && (
                  <span className="text-lg sm:text-xl text-gray-500 line-through">
                    AED {product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

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

              {product.shortDescription && (
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold text-amber-900">Product Details</h3>
                  <p className="text-base sm:text-lg text-amber-800 leading-relaxed">{product.shortDescription}</p>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium text-amber-900">Quantity:</span>
                  <div className={`flex items-center gap-3 rounded-full px-4 py-2 ${isOutOfStock ? 'bg-gray-100' : 'bg-white'
                    }`}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                      -
                    </button>
                    <span className={`font-bold w-8 text-center ${isOutOfStock ? 'text-gray-400' : 'text-amber-900'
                      }`}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={isOutOfStock || quantity >= product.stock}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOutOfStock || quantity >= product.stock
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

                {/* Add to Cart Button with Quantity Error Below */}
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <button
                      onClick={handleMainProductAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 py-3 sm:py-4 rounded-full font-medium transform transition-all flex items-center justify-center gap-3 ${isOutOfStock
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
                      className={`p-3 sm:p-4 rounded-full border-2 transition-all ${isOutOfStock
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : isFavorite
                          ? 'bg-red-50 border-red-200 text-red-500 hover:border-red-300'
                          : 'bg-white border-amber-200 text-amber-900 hover:border-orange-300'
                        }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                    </button>
                  </div>

                  {/* Quantity Error Message - Shows right below Add to Cart button */}
                  {quantityError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-pulse">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 font-medium">{quantityError}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-6 border-t border-amber-200">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <Truck className="w-4 h-4" />
                  <span>Free Delivery if total order is above AED 100</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <Shield className="w-4 h-4" />
                  <span>Quality assured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-8">You May Also Like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  className={`bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg transform transition-all duration-300 cursor-pointer ${isRelatedOutOfStock
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2'
                    }`}
                  onClick={() => !isRelatedOutOfStock && router.push(`/products/${relatedProduct.id}`)}
                >
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative group">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <>
                        <img
                          src={relatedProduct.images[currentImageIndex]}
                          alt={relatedProduct.name}
                          className="w-full h-full object-contain p-2"
                        />

                        {/* Navigation Arrows for Related Products */}
                        {hasMultipleRelatedImages && (
                          <>
                            <button
                              onClick={(e) => prevRelatedImage(relatedProduct.id, e)}
                              className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-amber-900 rounded-full p-1 sm:p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => nextRelatedImage(relatedProduct.id, e)}
                              className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-amber-900 rounded-full p-1 sm:p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </>
                        )}

                        {/* Image Dots Indicator for Related Products */}
                        {hasMultipleRelatedImages && (
                          <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
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
                                className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentImageIndex
                                  ? 'bg-orange-500'
                                  : 'bg-white/80 hover:bg-white'
                                  }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Image Counter for Related Products */}
                        {hasMultipleRelatedImages && (
                          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-black/50 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            {currentImageIndex + 1} / {relatedProduct.images.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-4xl sm:text-6xl">{relatedEmoji}</div>
                    )}

                    {relatedDiscount > 0 && (
                      <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                        -{relatedDiscount}%
                      </div>
                    )}

                    {/* Stock badge for related products */}
                    {isRelatedOutOfStock && (
                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                        Out of Stock
                      </div>
                    )}
                    {isRelatedLowStock && !isRelatedOutOfStock && (
                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                        Low Stock
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-2 line-clamp-1">{relatedProduct.name}</h3>
                    {relatedProduct.shortDescription && (
                      <p className="text-amber-700 text-xs sm:text-sm mb-3 line-clamp-2">
                        {relatedProduct.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className={`text-lg sm:text-xl font-bold ${isRelatedOutOfStock ? 'text-gray-400' : 'text-amber-900'
                          }`}>
                          AED {relatedProduct.discountedPrice.toFixed(2)}
                        </span>
                        {relatedProduct.originalPrice > relatedProduct.discountedPrice && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            AED {relatedProduct.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleRelatedProductAddToCart(relatedProduct.id, e, relatedProduct)}
                        disabled={isRelatedOutOfStock}
                        className={`p-2 sm:p-3 rounded-full transition-all transform ${isRelatedOutOfStock
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isAdded
                            ? 'bg-green-500 text-white shadow-lg hover:scale-110'
                            : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-lg hover:scale-105'
                          }`}
                      >
                        {isRelatedOutOfStock
                          ? <X className="w-4 h-4" />
                          : isAdded
                            ? <CheckCircle className="w-4 h-4" />
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

      <Footer />
    </div>
  );
}