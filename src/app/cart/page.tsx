"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, Ticket, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import FloatingElements from '../components/FloatingElements';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
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
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/userside/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        console.error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
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
        fetchCart(); // Refresh cart data
      } else {
        alert('Failed to update quantity');
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Error updating quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/userside/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCart(); // Refresh cart data
      } else {
        alert('Failed to remove item');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Error removing item');
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
          setCouponMessage(`🎉 ${data.coupon.discountAmount} discount applied!`);
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
    router.push('/cart/checkout');
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

  // Calculate order summary
  const subtotal = cart?.total || 0;
  const shipping = subtotal > 500 ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = Math.max(0, subtotal + shipping + tax - discount);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => {}} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-orange-600" />
          <h1 className="text-4xl font-bold text-amber-900">Shopping Cart</h1>
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {cart?.items?.length || 0} items
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {!cart || cart.items.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-amber-900 mb-2">Your cart is empty</h3>
                <p className="text-amber-700 mb-6">Add some delicious kitchen tools to get started!</p>
                <button 
                  onClick={() => router.push('/products')}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.items.map((item) => {
                const productEmoji = getProductEmoji(item.name);
                
                return (
                  <div key={item.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-3xl">{productEmoji}</div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-amber-900 mb-1">{item.name}</h3>
                            <span className="text-orange-600 font-medium">${item.price.toFixed(2)} each</span>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-amber-50 rounded-full px-4 py-2">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-amber-900 w-8 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-amber-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-6">
              <h3 className="text-xl font-bold text-amber-900 mb-6">Order Summary</h3>
              
              {/* Coupon Section */}
              <div className="mb-6">
                <div className="flex gap-2 mb-3">
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
                    className="flex-1 px-4 py-2 border-2 border-amber-200 rounded-full focus:border-orange-400 outline-none transition-all"
                  />
                  <button 
                    onClick={applyCoupon}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-sm ${
                    couponMessage.includes('Invalid') || couponMessage.includes('Error') 
                      ? 'text-red-500' 
                      : 'text-green-500'
                  }`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-amber-800">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-amber-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-amber-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={proceedToCheckout}
                disabled={!cart || cart.items.length === 0}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              {shipping > 0 && subtotal < 500 && (
                <p className="text-center text-sm text-amber-700 mt-4">
                  Add ${(500 - subtotal).toFixed(2)} more for FREE shipping!
                </p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h4 className="font-bold text-amber-900 mb-4">Why Shop With Us?</h4>
              <div className="space-y-3 text-sm text-amber-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  Free shipping on orders over $500
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  30-day money-back guarantee
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  Secure payment processing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}