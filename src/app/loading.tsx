// src/app/loading.tsx
'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 100); // Small delay to prevent flash on fast loads

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center bg-white rounded-3xl p-8 shadow-2xl border border-orange-200">
        <div className="relative inline-block mb-4">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full"></div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-amber-900 mb-2">Shop House</h3>
        <p className="text-amber-700">Preparing your kitchen...</p>
      </div>
    </div>
  );
}