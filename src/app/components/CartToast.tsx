"use client";

import { useEffect, useState } from 'react';
import { ShoppingCart, X, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface CartToastProps {
  isVisible: boolean;
  onClose: () => void;
  onViewCart?: () => void;
  onContinueShopping?: () => void;
}

export default function CartToast({
  isVisible,
  onClose,
  onViewCart,
  onContinueShopping
}: CartToastProps) {
  const [shouldRender, setShouldRender] = useState(false);

  // Handle mount/unmount animation
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Mobile version */}
      <div className={`lg:hidden fixed inset-x-4 bottom-4 z-50 transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-green-700 to-emerald-700 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Item Added to Cart!</h3>
                  <p className="text-sm text-green-100">Ready to complete your order?</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close notification"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 bg-white">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={() => {
                  onViewCart?.();
                  onClose();
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <ShoppingCart className="w-4 h-4" />
                View Cart
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>

              <button
                onClick={() => {
                  onContinueShopping?.();
                  onClose();
                }}
                className="flex items-center justify-center gap-2 bg-white border-2 border-emerald-200 text-emerald-900 py-3 px-4 rounded-xl font-medium hover:bg-emerald-50 hover:border-emerald-300 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                Shop More
              </button>
            </div>

            {/* Incentive Message */}
            <div className="mt-4 pt-4 border-t border-emerald-100">
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-700">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-medium">🎉 Free delivery on orders over AED 100!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop version */}
      <div className={`hidden lg:block fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl overflow-hidden min-w-[400px] max-w-lg">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-green-700 to-emerald-700 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Successfully Added to Cart!</h3>
                  <p className="text-sm text-green-100">What would you like to do next?</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close notification"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 bg-white">
            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                href="/cart"
                onClick={() => {
                  onViewCart?.();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 group"
              >
                <ShoppingCart className="w-5 h-5" />
                Go to Cart & Checkout
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>

              <button
                onClick={() => {
                  onContinueShopping?.();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-emerald-200 text-emerald-900 py-4 px-6 rounded-xl font-bold hover:bg-emerald-50 hover:border-emerald-300 transform hover:scale-[1.02] transition-all duration-200"
              >
                <Sparkles className="w-5 h-5" />
                Continue Shopping
              </button>
            </div>

            {/* Incentive Message */}
            {/* <div className="mt-5 pt-5 border-t border-emerald-100">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-full">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="font-bold">🚚 Free Shipping Available!</span>
                  </div>
                  <span className="text-sm">Add AED 100+ to cart</span>
                </div>
              </div>
            </div> */}

          </div>
        </div>
      </div>
    </>
  );
}