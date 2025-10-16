"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, Ticket, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import FloatingElements from '../components/FloatingElements';

interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  category: string;
}

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Professional Chef Knife Set',
      price: '189',
      image: '🔪',
      quantity: 1,
      category: 'Knives & Cutlery'
    },
    {
      id: 2,
      name: 'Commercial Blender',
      price: '156',
      image: '🥤',
      quantity: 1,
      category: 'Appliances'
    },
    {
      id: 3,
      name: 'Cutting Board Set',
      price: '78',
      image: '🥬',
      quantity: 2,
      category: 'Utensils'
    }
  ]);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const subtotal = cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax - discount;

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyCoupon = () => {
    const coupons: { [key: string]: number } = {
      'WELCOME10': 10,
      'CHEF20': 20,
      'KITCHEN25': 25
    };

    if (coupons[couponCode.toUpperCase()]) {
      const discountAmount = coupons[couponCode.toUpperCase()];
      setDiscount(discountAmount);
      setCouponMessage(`🎉 ${discountAmount}% discount applied!`);
    } else {
      setDiscount(0);
      setCouponMessage('Invalid coupon code');
    }
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => {}} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-orange-600" />
          <h1 className="text-4xl font-bold text-amber-900">Shopping Cart</h1>
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {cartItems.length} items
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.length === 0 ? (
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
              cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <div className="text-3xl">{item.image}</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-amber-900 mb-1">{item.name}</h3>
                          <span className="text-orange-600 font-medium">{item.category}</span>
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
                        <span className="text-2xl font-bold text-amber-900">{item.price} K</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
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
                    couponMessage.includes('Invalid') ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-amber-800">
                  <span>Subtotal</span>
                  <span>{subtotal} K</span>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `${shipping} K`}</span>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>Tax</span>
                  <span>{tax.toFixed(2)} K</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{discount}%</span>
                  </div>
                )}
                <div className="border-t border-amber-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-amber-900">
                    <span>Total</span>
                    <span>{total.toFixed(2)} K</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={proceedToCheckout}
                disabled={cartItems.length === 0}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              {shipping > 0 && (
                <p className="text-center text-sm text-amber-700 mt-4">
                  Add {(500 - subtotal).toFixed(2)} K more for FREE shipping!
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
                  Free shipping on orders over 500K
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