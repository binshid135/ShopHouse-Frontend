"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, Ticket, ArrowRight, RefreshCw, LogIn, UserPlus, AlertCircle, X, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import FloatingElements from '../components/FloatingElements';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/cartContext';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  stock: number;
}

interface Cart {
  cartId: string;
  items: CartItem[];
  total: number;
}

interface CouponError {
  type: 'error' | 'warning' | 'success';
  message: string;
  details?: string;
}

export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<CouponError | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [revalidatingCoupon, setRevalidatingCoupon] = useState(false);
  const { refreshCart } = useCart();

  useEffect(() => {
    checkAuthAndFetchCart();
  }, []);

  // Revalidate coupon when cart changes
  useEffect(() => {
    if (appliedCoupon && cart && cart.items.length > 0) {
      revalidateCoupon();
    }
  }, [cart?.total, cart?.items?.length]);

  const checkAuthAndFetchCart = async () => {
    try {
      setLoading(true);
      setCartError(null);

      const authResponse = await fetch('/api/auth/me');
      const authData = await authResponse.json();

      if (authData.user) {
        setUser(authData.user);
      }

      const cartResponse = await fetch('/api/userside/cart');
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        setCart(cartData);
        
        // If cart is empty, remove any applied coupon
        if (cartData.items.length === 0 && appliedCoupon) {
          removeCoupon();
        }
      } else {
        console.error('Failed to fetch cart');
        // If we can't fetch cart, remove coupon for safety
        if (appliedCoupon) {
          removeCoupon();
        }
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCartError('Failed to load cart. Please try again.');
      // If error fetching cart, remove coupon for safety
      if (appliedCoupon) {
        removeCoupon();
      }
    } finally {
      setLoading(false);
    }
  };

  const revalidateCoupon = async () => {
    if (!appliedCoupon || !couponCode.trim() || !cart) return;
    
    try {
      setRevalidatingCoupon(true);
      
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: cart.total,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        // Update discount with new amount based on current cart total
        setDiscount(data.coupon.discountAmount);
        setAppliedCoupon(data.coupon);
        
        // Show success message if discount amount changed
        if (data.coupon.discountAmount !== discount) {
          setCouponMessage({
            type: 'success',
            message: `Coupon Applied Successfully!`,
            details: `You saved AED ${data.coupon.discountAmount.toFixed(2)} (${data.coupon.discountValue}% off)`
          });
        }
      } else {
        // Coupon is no longer valid with new cart total
        removeCoupon();
        setCouponMessage({
          type: 'error',
          message: 'Coupon no longer valid',
          details: data.error || 'Cart changes made this coupon invalid'
        });
      }
    } catch (error) {
      console.error('Failed to revalidate coupon:', error);
      // Keep the coupon but show warning
      setCouponMessage({
        type: 'warning',
        message: 'Unable to verify coupon',
        details: 'Discount applied but please verify eligibility'
      });
    } finally {
      setRevalidatingCoupon(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number, currentStock: number, productName: string) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }

    if (newQuantity > currentStock) {
      setCartError(`Only ${currentStock} items available for ${productName}`);
      setTimeout(() => setCartError(null), 5000);
      return;
    }

    try {
      const response = await fetch('/api/userside/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        await checkAuthAndFetchCart(); // Wait for cart refresh
        refreshCart();
      } else {
        const errorData = await response.json();
        setCartError(errorData.error || 'Failed to update quantity');
        setTimeout(() => setCartError(null), 5000);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setCartError('Error updating quantity');
      setTimeout(() => setCartError(null), 5000);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/userside/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await checkAuthAndFetchCart(); // Wait for cart refresh
        refreshCart();
        
        // If cart becomes empty after removal, remove coupon
        if (cart && cart.items.length === 1) { // About to remove last item
          removeCoupon();
        }
      } else {
        setCartError('Failed to remove item');
        setTimeout(() => setCartError(null), 5000);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      setCartError('Error removing item');
      setTimeout(() => setCartError(null), 5000);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({
        type: 'error',
        message: 'Coupon code is required',
        details: 'Please enter a coupon code to apply discount'
      });
      return;
    }

    if (!cart || cart.items.length === 0 || subtotal === 0) {
      setCouponMessage({
        type: 'error',
        message: 'Cart is empty',
        details: 'Add items to your cart before applying coupon'
      });
      return;
    }

    try {
      setCouponMessage({
        type: 'warning',
        message: 'Validating coupon...'
      });

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: subtotal,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setDiscount(data.coupon.discountAmount);
        setAppliedCoupon(data.coupon);
        setCouponMessage({
          type: 'success',
          message: `🎉 Coupon applied successfully!`,
          details: `You saved AED ${data.coupon.discountAmount.toFixed(2)} (${data.coupon.discountType === 'percentage' 
            ? `${data.coupon.discountValue}% off` 
            : `AED ${data.coupon.discountValue} off`
          })`
        });
      } else {
        setDiscount(0);
        setAppliedCoupon(null);
        
        // Handle specific error cases
        let errorMessage = data.error || 'Invalid coupon code';
        let errorDetails = 'Please check the code and try again';
        
      

        setCouponMessage({
          type: 'error',
          message: errorMessage,
          details: errorDetails
        });
      }
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponMessage({
        type: 'error',
        message: 'Network error',
        details: 'Failed to validate coupon. Please check your connection and try again.'
      });
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponMessage(null);
  };

  const proceedToCheckout = () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      localStorage.setItem('deliveryOption', deliveryOption);
      
      // Store coupon data in localStorage
      if (appliedCoupon) {
        localStorage.setItem('couponCode', couponCode);
        localStorage.setItem('couponDiscount', discount.toString());
        localStorage.setItem('couponData', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('couponCode');
        localStorage.removeItem('couponDiscount');
        localStorage.removeItem('couponData');
      }
      
      router.push('/login');
      return;
    }

    const outOfStockItems = cart?.items.filter(item => item.stock <= 0) || [];
    if (outOfStockItems.length > 0) {
      setCartError('Some items in your cart are out of stock. Please remove them before checkout.');
      setTimeout(() => setCartError(null), 5000);
      return;
    }

    const insufficientStockItems = cart?.items.filter(item => item.quantity > item.stock) || [];
    if (insufficientStockItems.length > 0) {
      setCartError('Some items in your cart have insufficient stock. Please update quantities before checkout.');
      setTimeout(() => setCartError(null), 5000);
      return;
    }

    if (cart && cart.items.length > 0) {
      localStorage.setItem('deliveryOption', deliveryOption);
      
      // Store coupon data in localStorage
      if (appliedCoupon) {
        localStorage.setItem('couponCode', couponCode);
        localStorage.setItem('couponDiscount', discount.toString());
        localStorage.setItem('couponData', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('couponCode');
        localStorage.removeItem('couponDiscount');
        localStorage.removeItem('couponData');
      }
      
      router.push('/cart/checkout');
    }
  };

  const getProductEmoji = (productName: string) => {
    const name = productName.toLowerCase();
    if (name.includes('knife') || name.includes('cutlery')) return '🔪';
    if (name.includes('blender') || name.includes('processor') || name.includes('appliance')) return '🥤';
    if (name.includes('cookware') || name.includes('pan') || name.includes('pot')) return '🍳';
    if (name.includes('bowl') || name.includes('utensil')) return '🥣';
    if (name.includes('baking') || name.includes('bakeware')) return '🎂';
    if (name.includes('mixer') || name.includes('tool')) return '⚙️';
    if (name.includes('sharpener')) return '⚔️';
    return '🍴';
  };

  const getStockStatus = (item: CartItem) => {
    if (item.stock <= 0) {
      return {
        status: 'out-of-stock',
        message: 'Out of Stock',
        color: 'red',
        badge: (
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Out of Stock
          </span>
        )
      };
    }

    if (item.quantity > item.stock) {
      return {
        status: 'insufficient-stock',
        message: `Only ${item.stock} available`,
        color: 'red',
        badge: (
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
            Only {item.stock} left
          </span>
        )
      };
    }

    if (item.stock < 5) {
      return {
        status: 'low-stock',
        message: `Only ${item.stock} left`,
        color: 'yellow',
        badge: (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">
            Only {item.stock} left
          </span>
        )
      };
    }

    return {
      status: 'in-stock',
      message: 'In Stock',
      color: 'green',
      badge: (
        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
          In Stock
        </span>
      )
    };
  };

  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');
  const subtotal = cart?.total || 0;
  const shipping = deliveryOption === 'pickup' ? 0 : (subtotal > 100 ? 0 : 7);
  const total = Math.max(0, subtotal + shipping - discount);

  const hasCartIssues = cart?.items.some(item =>
    item.stock <= 0 || item.quantity > item.stock
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-x-hidden">
        <FloatingElements />
        <Header searchQuery={""} setSearchQuery={() => { }} />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-x-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => { }} />

      {/* Main Container with Safe Area Handling */}
      <div className="w-full max-w-[100vw] px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12 box-border">
        {/* Error Message */}
        {cartError && (
          <div className="mb-4 w-full max-w-full">
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded-2xl flex items-center gap-2 w-full">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="font-medium text-sm flex-1 break-words">{cartError}</p>
              <button
                onClick={() => setCartError(null)}
                className="ml-2 text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 w-full">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-amber-900 break-words">Shopping Cart</h1>
            {cart && cart.items.length > 0 && (
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          {cart && cart.items.length > 0 && (
            <div className="flex items-center gap-2">
              {!user && (
                <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full whitespace-nowrap">
                  Shopping as Guest
                </div>
              )}
              <button
                onClick={checkAuthAndFetchCart}
                className="flex items-center gap-1 bg-white text-amber-900 px-3 py-2 rounded-full hover:bg-orange-50 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="sm:hidden">Refresh</span>
              </button>
            </div>
          )}
        </div>

        {/* User Not Logged In Warning */}
        {!user && cart && cart.items.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl mb-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium mb-1 text-sm">💡 Sign in for a better experience!</p>
                <p className="text-xs">Create an account to save your cart and view order history.</p>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => {
                    localStorage.setItem('redirectAfterLogin', '/cart');
                    router.push('/login');
                  }}
                  className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-full hover:bg-orange-600 transition-colors text-xs flex-1 justify-center"
                >
                  <LogIn className="w-3 h-3" />
                  Sign In
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('redirectAfterLogin', '/cart');
                    router.push('/signup');
                  }}
                  className="flex items-center gap-1 border border-orange-500 text-orange-500 px-3 py-2 rounded-full hover:bg-orange-50 transition-colors text-xs flex-1 justify-center"
                >
                  <UserPlus className="w-3 h-3" />
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Revalidation Indicator */}
        {revalidatingCoupon && (
          <div className="mb-4 w-full max-w-full">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-3 rounded-2xl flex items-center gap-2 w-full">
              <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
              <p className="font-medium text-sm flex-1 break-words">Updating coupon discount for current cart...</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Cart Items - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 space-y-4 w-full">
            {!cart || cart.items.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg w-full">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-amber-900 mb-2">Your cart is empty</h3>
                <p className="text-amber-700 mb-4 text-sm">Add some delicious kitchen tools to get started!</p>
                <button
                  onClick={() => router.push('/products')}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all text-sm w-full sm:w-auto"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.items.map((item) => {
                const productEmoji = getProductEmoji(item.name);
                const stockStatus = getStockStatus(item);
                const isOutOfStock = item.stock <= 0;
                const hasInsufficientStock = item.quantity > item.stock;

                return (
                  <div key={item.id} className={`bg-white rounded-2xl p-4 shadow-lg transition-all w-full ${isOutOfStock ? 'opacity-60' : 'hover:shadow-xl'
                    }`}>
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-xl">{productEmoji}</div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-amber-900 mb-1 line-clamp-2 break-words">{item.name}</h3>
                            <span className="text-orange-600 font-medium text-sm">AED {item.price.toFixed(2)} each</span>

                            {/* Stock Status Badge */}
                            <div className="mt-2">
                              {stockStatus.badge}
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 rounded-full px-3 py-2 ${isOutOfStock ? 'bg-gray-100' : 'bg-amber-50'
                              }`}>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock, item.name)}
                                disabled={isOutOfStock}
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isOutOfStock
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-white hover:bg-gray-100'
                                  }`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className={`font-bold w-6 text-center text-sm ${isOutOfStock ? 'text-gray-400' : 'text-amber-900'
                                }`}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock, item.name)}
                                disabled={isOutOfStock || item.quantity >= item.stock}
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isOutOfStock || item.quantity >= item.stock
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-white hover:bg-gray-100'
                                  }`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <span className={`text-lg font-bold ${isOutOfStock ? 'text-gray-400' : 'text-amber-900'
                            }`}>
                            AED {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        {/* Warning Messages */}
                        {isOutOfStock && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-xl text-xs">
                            <p className="text-red-700 font-medium">
                              This item is out of stock. Please remove it to proceed with checkout.
                            </p>
                          </div>
                        )}

                        {hasInsufficientStock && !isOutOfStock && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-xl text-xs">
                            <p className="text-yellow-700 font-medium">
                              Only {item.stock} items available. Please reduce quantity to proceed.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Order Summary - Full width on mobile, 1/3 on desktop */}
          <div className="space-y-4 w-full">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h3 className="text-lg font-bold text-amber-900 mb-4">Order Summary</h3>

              {/* User Status */}
              {user ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Signed in as {user.name}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-xl mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    Shopping as guest
                  </div>
                </div>
              )}

              {/* Cart Issues Warning */}
              {hasCartIssues && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <p className="text-xs font-medium">Some items need attention before checkout</p>
                  </div>
                </div>
              )}

              {/* Coupon Section */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-green-800 font-medium text-sm">Coupon Applied</p>
                          <p className="text-green-600 text-xs">{appliedCoupon.code} - {appliedCoupon.description}</p>
                          {revalidatingCoupon && (
                            <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Updating discount...
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        disabled={revalidatingCoupon}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          applyCoupon();
                        }
                      }}
                      className="flex-1 px-3 py-2 border-2 border-amber-200 rounded-full focus:border-orange-400 outline-none transition-all text-sm"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || !cart || cart.items.length === 0}
                      className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-3 py-2 rounded-full hover:shadow-lg transition-all flex items-center gap-1 justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Ticket className="w-4 h-4" />
                      Apply Coupon
                    </button>
                  </div>
                )}

                {/* Coupon Message */}
                {couponMessage && (
                  <div className={`rounded-xl p-3 ${
                    couponMessage.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : couponMessage.type === 'error'
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                  }`}>
                    <div className="flex items-start gap-2">
                      {couponMessage.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      {couponMessage.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      {couponMessage.type === 'warning' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{couponMessage.message}</p>
                        {couponMessage.details && (
                          <p className="text-xs mt-1 opacity-90">{couponMessage.details}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setCouponMessage(null)}
                        className="text-current hover:opacity-70 transition-opacity flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-amber-800 text-sm">
                  <span>Subtotal</span>
                  <span>AED {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-800 text-sm">
                  <span>Delivery charge</span>
                  <span>{shipping === 0 ? 'FREE' : `AED ${shipping.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Discount</span>
                    <span>-AED {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-amber-200 pt-2">
                  <div className="flex justify-between text-base font-bold text-amber-900">
                    <span>Total</span>
                    <span>AED {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Option */}
              <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
                <h3 className="text-lg font-bold text-amber-900 mb-3">Delivery Option</h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border-2 border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="delivery"
                      checked={deliveryOption === 'delivery'}
                      onChange={() => setDeliveryOption('delivery')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-amber-900">Home Delivery</span>
                      </div>
                      <p className="text-xs text-amber-600 mt-1">
                        {subtotal < 100 ? `Add AED ${(100 - subtotal).toFixed(2)} more for FREE delivery` : 'Free delivery applied'}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="pickup"
                      checked={deliveryOption === 'pickup'}
                      onChange={() => setDeliveryOption('pickup')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-amber-900">Pickup from Store</span>
                        <span className="text-green-600 text-sm">FREE</span>
                      </div>
                      <p className="text-xs text-amber-600 mt-1">
                        Collect your order from our store in Al Ain
                      </p>
                    </div>
                  </label>
                </div>

                {/* Store Address */}
                {deliveryOption === 'pickup' && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-900">Store Address:</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Shop House General trading, ALAIN TOWN CENTER, NEAR LUCKY PLAZA
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      📞 Contact: +971 50 719 1804
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={proceedToCheckout}
                disabled={!cart || cart.items.length === 0 || hasCartIssues || revalidatingCoupon}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mb-2"
              >
                {!user ? 'Sign In to Checkout' : `Proceed to Checkout`}
                <ArrowRight className="w-4 h-4" />
              </button>

              {shipping > 0 && subtotal < 100 && (
                <p className="text-center text-xs text-amber-700">
                  Add AED {(100 - subtotal).toFixed(2)} more for FREE Delivery!
                </p>
              )}

              {!user && (
                <p className="text-center text-xs text-amber-600 mt-1">
                  You'll be asked to sign in or create an account before checkout
                </p>
              )}

              {hasCartIssues && (
                <p className="text-center text-xs text-red-600 mt-1">
                  Please resolve stock issues before checkout
                </p>
              )}

              {revalidatingCoupon && (
                <p className="text-center text-xs text-blue-600 mt-1">
                  Updating coupon discount...
                </p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h4 className="font-bold text-amber-900 mb-3 text-sm">Why Shop With Us?</h4>
              <div className="space-y-2 text-xs text-amber-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  Free Delivery on orders over AED 100
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  Secure payment processing
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  </div>
                  Dedicated customer support
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <h4 className="font-bold text-amber-900 mb-3 text-sm">Secure Shopping</h4>
              <div className="space-y-2 text-xs text-amber-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs">🔒</span>
                  </div>
                  Your cart is saved securely
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs">🛡️</span>
                  </div>
                  Privacy protected
                </div>
                {!user && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold text-xs">💡</span>
                    </div>
                    <span className="text-orange-600 text-xs">
                      <button
                        onClick={() => router.push('/signup')}
                        className="underline hover:no-underline"
                      >
                        Create an account
                      </button>{' '}
                      to save your cart
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}