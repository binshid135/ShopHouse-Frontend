import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';

const HeroSection: React.FC = () => {
  return (
    <section className="relative px-6 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <HeroContent />
          <FeaturedProduct />
        </div>
      </div>
    </section>
  );
};

const HeroContent: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
      Equip your <span className="text-orange-600">kitchen</span>
      <br />
      before your service
    </h1>
    <p className="text-lg text-amber-800 max-w-md">
      Boost your kitchen efficiency and build your culinary excellence with premium equipment every morning
    </p>
    <div className="flex gap-4">
      <button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2">
        Order now
        <ShoppingCart className="w-4 h-4" />
      </button>
      <button className="text-orange-600 font-medium hover:underline">
        More menu
      </button>
    </div>
  </div>
);

const FeaturedProduct: React.FC = () => (
  <div className="relative">
    <div className="relative bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 rounded-full w-full aspect-square flex items-center justify-center shadow-xl p-12">
      <div className="absolute -top-4 right-8 bg-white px-6 py-3 rounded-full shadow-lg">
        <span className="text-sm font-semibold text-amber-900">Team infrared cooker</span>
      </div>
      
      <div className="relative w-80 h-80 flex items-center justify-center">
        <Image 
          src="/teaminfrared.png" 
          alt="Professional Cookware" 
          width={320} 
          height={320} 
          className="w-full h-full object-contain"
        />
      </div>

      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg">
        <span className="text-2xl font-bold text-amber-900">$149</span>
      </div>

      <div className="absolute top-8 right-4 bg-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <span className="font-bold text-amber-900">4.9</span>
      </div>
    </div>
  </div>
);

export default HeroSection;