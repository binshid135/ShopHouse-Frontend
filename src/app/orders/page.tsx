"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, Star, ArrowRight } from 'lucide-react';
import FloatingElements from '../components/FloatingElements';
import Header from '../components/Header';

interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  total: string;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface OrderItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  rating?: number;
}

export default function Orders() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'delivered' | 'shipped' | 'processing'>('all');

  const orders: Order[] = [
    {
      id: 'ORD-7842',
      date: '2024-01-15',
      status: 'delivered',
      total: '423',
      trackingNumber: 'TRK78421563',
      items: [
        {
          id: 1,
          name: 'Professional Chef Knife Set',
          price: '189',
          image: '🔪',
          quantity: 1,
          rating: 5
        },
        {
          id: 2,
          name: 'Cutting Board Set',
          price: '78',
          image: '🥬',
          quantity: 2,
          rating: 4
        }
      ]
    },
    {
      id: 'ORD-6591',
      date: '2024-01-12',
      status: 'shipped',
      total: '156',
      trackingNumber: 'TRK65918742',
      estimatedDelivery: '2024-01-18',
      items: [
        {
          id: 3,
          name: 'Commercial Blender',
          price: '156',
          image: '🥤',
          quantity: 1
        }
      ]
    },
    {
      id: 'ORD-5123',
      date: '2024-01-10',
      status: 'processing',
      total: '267',
      items: [
        {
          id: 4,
          name: 'Industrial Cookware Set',
          price: '267',
          image: '🍳',
          quantity: 1
        }
      ]
    }
  ];

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-600';
      case 'shipped':
        return 'bg-blue-100 text-blue-600';
      case 'processing':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={""} setSearchQuery={() => {}} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-orange-600" />
          <h1 className="text-4xl font-bold text-amber-900">Your Orders</h1>
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {orders.length} orders
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'processing', label: 'Processing' },
            { key: 'shipped', label: 'Shipped' },
            { key: 'delivered', label: 'Delivered' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
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

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-amber-900 mb-2">No orders found</h3>
              <p className="text-amber-700 mb-6">
                {activeTab === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `No orders with status "${activeTab}"`}
              </p>
              {activeTab === 'all' && (
                <button 
                  onClick={() => router.push('/products')}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all"
                >
                  Start Shopping
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-amber-200">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-amber-900">Order {order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-amber-700">Placed on {formatDate(order.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-900">{order.total} K</p>
                    <p className="text-sm text-amber-700">{order.items.length} item(s)</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <div className="text-2xl">{item.image}</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-900 mb-1">{item.name}</h4>
                        <div className="flex items-center gap-4">
                          <span className="text-amber-700">Qty: {item.quantity}</span>
                          <span className="text-lg font-bold text-amber-900">{item.price} K</span>
                        </div>
                      </div>
                      {item.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= item.rating! 
                                  ? 'text-yellow-500 fill-yellow-500' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="space-y-2">
                    {order.trackingNumber && (
                      <p className="text-sm text-amber-700">
                        Tracking: <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                    )}
                    {order.estimatedDelivery && (
                      <p className="text-sm text-amber-700">
                        Estimated delivery: {formatDate(order.estimatedDelivery)}
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
                    <button 
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}