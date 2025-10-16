import React from 'react';

const FloatingElements: React.FC = () => {
  return (
    <>
      <div className="absolute top-10 right-20 w-16 h-16 bg-orange-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
      <div className="absolute top-40 right-40 w-12 h-12 bg-amber-400 rounded-full opacity-30 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4s'}}></div>
      <div className="absolute bottom-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-25 animate-bounce" style={{animationDelay: '1s', animationDuration: '3.5s'}}></div>
      <div className="absolute top-60 left-20 w-10 h-10 bg-amber-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}></div>
    </>
  );
};

export default FloatingElements;