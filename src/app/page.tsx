"use client";
import React, { useState } from 'react';
import { ShoppingCart, Search, Star, Clock, Utensils, ChefHat } from 'lucide-react';

export default function KitchenShopLanding() {
  const [searchQuery, setSearchQuery] = useState('');

  const popularProducts = [
    {
      id: 1,
      name: 'Professional Chef Knife Set',
      price: '189',
      image: '🔪',
      rating: 4.9,
      category: 'Hot',
      tag: 'Sale'
    },
    {
      id: 2,
      name: 'Commercial Blender',
      price: '156',
      image: '🥤',
      rating: 4.7,
      category: 'Hot',
      tag: 'Sale'
    },
    {
      id: 3,
      name: 'Industrial Cookware Set',
      price: '267',
      image: '🍳',
      rating: 4.8,
      category: 'Hot',
      tag: 'Sale'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute top-10 right-20 w-16 h-16 bg-orange-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
      <div className="absolute top-40 right-40 w-12 h-12 bg-amber-400 rounded-full opacity-30 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4s'}}></div>
      <div className="absolute bottom-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-25 animate-bounce" style={{animationDelay: '1s', animationDuration: '3.5s'}}></div>
      <div className="absolute top-60 left-20 w-10 h-10 bg-amber-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}></div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg shadow-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
              Chef's Blend
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#about" className="text-amber-900 hover:text-orange-600 transition-colors">About us</a>
            <a href="#products" className="text-amber-900 hover:text-orange-600 transition-colors">Our Products</a>
            <a href="#delivery" className="text-amber-900 hover:text-orange-600 transition-colors">Delivery</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white rounded-full border-2 border-transparent focus:border-orange-400 outline-none transition-all w-48"
              />
            </div>
            <button className="relative p-2 hover:bg-white rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6 text-amber-900" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                3
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
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

            <div className="relative">
              {/* Featured Product Card */}
              <div className="relative bg-gradient-to-br from-amber-900 to-orange-950 rounded-full w-full aspect-square flex items-center justify-center shadow-2xl">
                <div className="absolute -top-4 right-8 bg-white px-6 py-3 rounded-full shadow-lg">
                  <span className="text-sm font-semibold text-amber-900">Professional Cookware</span>
                </div>
                
                <div className="relative w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <div className="text-9xl">🍳</div>
                </div>

                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg">
                  <span className="text-2xl font-bold text-amber-900">24K+</span>
                </div>

                <div className="absolute top-8 right-4 bg-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-amber-900">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="relative px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-bold text-amber-900">Popular Now</h2>
            <Utensils className="w-6 h-6 text-orange-500" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {popularProducts.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="relative h-64 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                    <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                    <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                  </div>
                  <div className="text-8xl">{product.image}</div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-amber-900 mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-amber-900">{product.price} K</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                        {product.category}
                      </span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-medium">
                        {product.tag}
                      </span>
                    </div>
                    <button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-3 rounded-full hover:shadow-lg transform hover:scale-110 transition-all">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to use delivery service */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">
            How to use <span className="border-b-4 border-orange-500">delivery</span> service
          </h2>
        </div>
      </section>
    </div>
  );
}