"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, Star, ArrowRight, RefreshCw, LogIn, UserPlus } from 'lucide-react';
import FloatingElements from '../components/FloatingElements';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  images: string[];
}

interface Order {
  id: string;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  deliveryStatus?: string;
}

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'>('all');
  const [user, setUser] = useState<any>(null);

  const tabs = [
    { key: 'all' as const, label: 'All Orders' },
    { key: 'pending' as const, label: 'Pending' },
    { key: 'confirmed' as const, label: 'Confirmed' },
    { key: 'preparing' as const, label: 'Preparing' },
    { key: 'out_for_delivery' as const, label: 'Out for Delivery' },
    { key: 'delivered' as const, label: 'Delivered' },
    { key: 'cancelled' as const, label: 'Cancelled' },
  ];

  useEffect(() => {
    checkAuthAndFetchOrders();
  }, []);

  const checkAuthAndFetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const authResponse = await fetch('/api/auth/me');
      const authData = await authResponse.json();
      
      if (authData.user) {
        setUser(authData.user);
        // User is authenticated, fetch their orders
        const ordersResponse = await fetch('/api/userside/orders');
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        } else if (ordersResponse.status === 401) {
          setError('Please sign in to view your orders');
        } else {
          const errorData = await ordersResponse.json();
          setError(errorData.error || 'Failed to load orders');
        }
      } else {
        setError('Please sign in to view your orders');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'preparing':
      case 'confirmed':
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'cancelled':
        return <Package className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'preparing':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'confirmed':
        return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'pending':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusDisplayText = (status: Order['status']) => {
    switch (status) {
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'preparing':
        return 'Preparing';
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
        <FloatingElements />
        <Header searchQuery={""} setSearchQuery={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => {}} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-amber-900">
              {user ? 'Your Orders' : 'Order History'}
            </h1>
            {orders.length > 0 && (
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {orders.length} orders
              </span>
            )}
          </div>
          
          {user && orders.length > 0 && (
            <button
              onClick={checkAuthAndFetchOrders}
              className="flex items-center gap-2 bg-white text-amber-900 px-4 py-2 rounded-full hover:bg-orange-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl mb-6">
            <p className="mb-4">{error}</p>
            {error.includes('sign in') && (
              <div className="flex gap-4 flex-wrap">
                <button 
                  onClick={() => router.push('/login')}
                  className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button 
                  onClick={() => router.push('/signup')}
                  className="border border-orange-500 text-orange-500 px-6 py-2 rounded-full hover:bg-orange-50 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </button>
              </div>
            )}
          </div>
        )}

        {/* Only show tabs and orders if user is authenticated and has orders */}
        {user && orders.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white text-amber-900 hover:bg-orange-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders Count */}
            <div className="mb-6">
              <p className="text-amber-700">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                return (
                  <div key={order.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-amber-200">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-amber-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusDisplayText(order.status)}
                          </span>
                        </div>
                        <p className="text-amber-700">Placed on {formatDate(order.createdAt)}</p>
                        <p className="text-sm text-amber-600 mt-1">
                          Deliver to: {order.shippingAddress}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-900">AED {order.total.toFixed(2)}</p>
                        <p className="text-sm text-amber-700">{order.items.length} item(s)</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {order.items.map((item) => {
                        const productEmoji = getProductEmoji(item.productName);
                        
                        return (
                          <div key={item.id} className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {item.images && item.images.length > 0 ? (
                                <img 
                                  src={item.images[0]} 
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-2xl">{productEmoji}</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-amber-900 mb-1">{item.productName}</h4>
                              <div className="flex items-center gap-4">
                                <span className="text-amber-700">Qty: {item.quantity}</span>
                                <span className="text-lg font-bold text-amber-900">
                                  AED {(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-sm text-amber-600">AED {item.price.toFixed(2)} each</p>
                            </div>
                            {order.status === 'delivered' && (
                              <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors">
                                <Star className="w-4 h-4" />
                                Rate
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="space-y-2">
                        {/* <p className="text-sm text-amber-700">
                          Contact: {order.customerPhone}
                        </p> */}
                        {order.status === 'out_for_delivery' && (
                          <p className="text-sm text-blue-600 font-medium">
                            🚚 Your order is out for delivery
                          </p>
                        )}
                        {order.status === 'preparing' && (
                          <p className="text-sm text-purple-600 font-medium">
                            👨‍🍳 Your order is being prepared
                          </p>
                        )}
                        {order.status === 'confirmed' && (
                          <p className="text-sm text-amber-600 font-medium">
                            ✅ Order confirmed
                          </p>
                        )}
                        {order.status === 'pending' && (
                          <p className="text-sm text-orange-600 font-medium">
                            ⏳ Order received, processing soon
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-3">
                        {order.status === 'delivered' && (
                          <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors">
                            <Star className="w-4 h-4" />
                            Rate Products
                          </button>
                        )}
                        {/* <button 
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </button> */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {user && orders.length === 0 && !error && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-amber-900 mb-2">No orders yet</h3>
            <p className="text-amber-700 mb-6">Start shopping to see your orders here!</p>
            <button 
              onClick={() => router.push('/products')}
              className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Help Section */}
        {user && orders.length > 0 && (
          <div className="bg-white rounded-3xl p-6 mt-8 shadow-lg">
            <h3 className="text-lg font-bold text-amber-900 mb-4">Need Help with Your Order?</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-amber-700">
              <div>
                <p className="font-semibold mb-2">Order Status Guide:</p>
                <ul className="space-y-1">
                  <li>• <strong>Pending:</strong> Order received, awaiting confirmation</li>
                  <li>• <strong>Confirmed:</strong> Order confirmed, preparing for processing</li>
                  <li>• <strong>Preparing:</strong> Items are being prepared for delivery</li>
                  <li>• <strong>Out for Delivery:</strong> Order is on its way to you</li>
                  <li>• <strong>Delivered:</strong> Order has been delivered</li>
                  <li>• <strong>Cancelled:</strong> Order has been cancelled</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Contact Support:</p>
                <p>For any questions about your order, contact us at:</p>
                <p className="font-mono mt-1">📞 +971 50 719 1804</p>
                <p className="font-mono">📧 shophouse@gmail.com</p>
                <p className="text-xs mt-2 text-amber-600">
                  Reference your order ID when contacting support
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}