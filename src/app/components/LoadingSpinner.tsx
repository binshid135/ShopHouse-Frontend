// components/Loading.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface LoadingProps {
  message?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  showProgress = false,
  size = 'md'
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (showProgress) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            return 0;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 95);
        });
      }, 200);

      return () => {
        clearInterval(timer);
      };
    }
  }, [showProgress]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Spinner */}
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-orange-500 ${sizeClasses[size]}`}></div>
      
      {/* Message */}
      <p className="text-gray-600 text-sm font-medium">{message}</p>
      
      {/* Progress Bar */}
      {showProgress && (
        <div className="w-48 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-200 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;