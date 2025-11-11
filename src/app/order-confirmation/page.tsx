// app/order-confirmation/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Truck, Clock } from 'lucide-react';
import Header from '../components/Header';
import FloatingElements from '../components/FloatingElements';
import LoadingSpinner from '../components/LoadingSpinner';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: any[];
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/userside/orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
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
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Order Confirmed!</h1>
          <p className="text-amber-700 mb-6">Thank you for your purchase. Your order has been received.</p>
          
          {order && (
            <div className="text-left bg-amber-50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-amber-900 mb-4">Order Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                  <p><strong>Status:</strong> <span className="text-orange-600 capitalize">{order.status}</span></p>
                </div>
                <div>
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Phone:</strong> {order.customerPhone}</p>
                  <p><strong>Delivery:</strong> {order.shippingAddress}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            <a
              href="/products"
              className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors"
            >
              Continue Shopping
            </a>
            <a
              href="/orders"
              className="border border-amber-300 text-amber-700 px-6 py-3 rounded-full hover:bg-amber-50 transition-colors"
            >
              View Orders
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}