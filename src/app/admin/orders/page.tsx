// app/components/admin/AdminOrdersPage.tsx (Updated)
"use client";
import { useEffect, useState } from 'react';
import { Eye, Search, Filter, RefreshCw, Package, Truck, CheckCircle, XCircle, Clock, Store, Home } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  deliveryStatus: string;
  deliveryOption: 'delivery' | 'pickup'; // Add delivery option
  itemCount: number;
}

interface OrderDetail extends Order {
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    images: string[];
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all'); // Add delivery filter
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Orders', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'orange' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'preparing', label: 'Preparing', color: 'purple' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'yellow' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
  ];

  const deliveryOptions = [
    { value: 'all', label: 'All Types', icon: Package },
    { value: 'delivery', label: 'Home Delivery', icon: Home },
    { value: 'pickup', label: 'Store Pickup', icon: Store },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/userside/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
        setShowOrderModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  // Update your updateOrderStatus function in AdminOrdersPage.tsx
const updateOrderStatus = async (orderId: string, newStatus: string) => {
  setUpdatingStatus(orderId);
  try {
    const response = await fetch('/api/orders', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        status: newStatus,
        notes: `Status changed to ${newStatus} by admin`
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Show success message
      alert('Order status updated successfully!');
      fetchOrders(); // Refresh orders list
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } else {
      alert(data.error || 'Failed to update order status');
    }
  } catch (error) {
    console.error('Failed to update order status:', error);
    alert('Network error. Please try again.');
  } finally {
    setUpdatingStatus(null);
  }
};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'out_for_delivery': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDeliveryIcon = (option: 'delivery' | 'pickup') => {
    return option === 'pickup' ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />;
  };

  const getDeliveryColor = (option: 'delivery' | 'pickup') => {
    return option === 'pickup' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const getDeliveryLabel = (option: 'delivery' | 'pickup') => {
    return option === 'pickup' ? 'Store Pickup' : 'Home Delivery';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.shippingAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesDelivery = deliveryFilter === 'all' || order.deliveryOption === deliveryFilter;
    
    return matchesSearch && matchesStatus && matchesDelivery;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)} flex items-center gap-1 w-fit`}>
        {getStatusIcon(status)}
        {statusConfig?.label || status}
      </span>
    );
  };

  const getDeliveryBadge = (option: 'delivery' | 'pickup') => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDeliveryColor(option)} flex items-center gap-1 w-fit`}>
        {getDeliveryIcon(option)}
        {getDeliveryLabel(option)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID, name, phone, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <Package className="w-4 h-4 text-gray-400" />
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              {deliveryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerPhone}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {order.shippingAddress}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      AED {order.total.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getDeliveryBadge(order.deliveryOption)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => fetchOrderDetails(order.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Order #{selectedOrder.id.slice(-8).toUpperCase()}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600">Placed on {formatDate(selectedOrder.createdAt)}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                    <p><strong>Address:</strong> {selectedOrder.shippingAddress}</p>
                    <p><strong>Delivery Type:</strong> {getDeliveryBadge(selectedOrder.deliveryOption)}</p>
                  </div>
                </div>

                {/* Order Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Update Status:
                      </label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                        disabled={updatingStatus === selectedOrder.id}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      >
                        {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {updatingStatus === selectedOrder.id && (
                        <p className="text-sm text-gray-500">Updating status...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          AED {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-gray-600">AED {item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>AED {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Add print functionality if needed
                    window.print();
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}