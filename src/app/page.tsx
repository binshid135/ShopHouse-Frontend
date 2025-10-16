"use client";
import { useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PopularProducts from './components/PopularProducts';
import DeliveryService from './components/DeliveryService';
import FloatingElements from './components/FloatingElements';

export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  rating: number;
  category: string;
  tag: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const popularProducts: Product[] = [
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
      <FloatingElements />
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <HeroSection />
      <PopularProducts products={popularProducts} />
      <DeliveryService />
    </div>
  );
}