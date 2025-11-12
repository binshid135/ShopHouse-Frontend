"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, Ticket, ArrowRight, RefreshCw, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import FloatingElements from '../components/FloatingElements';
import LoadingSpinner from '../components/LoadingSpinner';

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

export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchCart();
  }, []);

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
      } else {
        console.error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCartError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
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
        checkAuthAndFetchCart();
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
        checkAuthAndFetchCart();
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
      setCouponMessage('Please enter a coupon code');
      return;
    }

    try {
      const response = await fetch('/api/user/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: cart?.total || 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setDiscount(data.coupon.discountAmount);
          setCouponMessage(`🎉 AED ${data.coupon.discountAmount.toFixed(2)} discount applied!`);
        } else {
          setDiscount(0);
          setCouponMessage(data.error || 'Invalid coupon code');
        }
      } else {
        const error = await response.json();
        setDiscount(0);
        setCouponMessage(error.error || 'Failed to apply coupon');
      }
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      setCouponMessage('Error applying coupon');
    }
  };

  const proceedToCheckout = () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
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

  const subtotal = cart?.total || 0;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.05;
  const total = Math.max(0, subtotal + shipping + tax - discount);

  const hasCartIssues = cart?.items.some(item => 
    item.stock <= 0 || item.quantity > item.stock
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-x-hidden">
        <FloatingElements />
        <Header searchQuery={""} setSearchQuery={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-x-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => {}} />
      
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                  <div key={item.id} className={`bg-white rounded-2xl p-4 shadow-lg transition-all w-full ${
                    isOutOfStock ? 'opacity-60' : 'hover:shadow-xl'
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
                            <div className={`flex items-center gap-2 rounded-full px-3 py-2 ${
                              isOutOfStock ? 'bg-gray-100' : 'bg-amber-50'
                            }`}>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock, item.name)}
                                disabled={isOutOfStock}
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                  isOutOfStock 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white hover:bg-gray-100'
                                }`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className={`font-bold w-6 text-center text-sm ${
                                isOutOfStock ? 'text-gray-400' : 'text-amber-900'
                              }`}>
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock, item.name)}
                                disabled={isOutOfStock || item.quantity >= item.stock}
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                  isOutOfStock || item.quantity >= item.stock
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white hover:bg-gray-100'
                                }`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <span className={`text-lg font-bold ${
                            isOutOfStock ? 'text-gray-400' : 'text-amber-900'
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
                <div className="flex flex-col gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        applyCoupon();
                      }
                    }}
                    className="flex-1 px-3 py-2 border-2 border-amber-200 rounded-full focus:border-orange-400 outline-none transition-all text-sm"
                  />
                  <button 
                    onClick={applyCoupon}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-3 py-2 rounded-full hover:shadow-lg transition-all flex items-center gap-1 justify-center text-sm"
                  >
                    <Ticket className="w-4 h-4" />
                    Apply Coupon
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-xs ${
                    couponMessage.includes('Invalid') || couponMessage.includes('Error') 
                      ? 'text-red-500' 
                      : 'text-green-500'
                  }`}>
                    {couponMessage}
                  </p>
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
                <div className="flex justify-between text-amber-800 text-sm">
                  <span>Tax (5%)</span>
                  <span>AED {tax.toFixed(2)}</span>
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

              <button 
                onClick={proceedToCheckout}
                disabled={!cart || cart.items.length === 0 || hasCartIssues}
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