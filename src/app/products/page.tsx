"use client";
import { useState } from 'react';
import { Filter, Grid, List, Star, ShoppingCart } from 'lucide-react';
import Header from './../components/Header'
import FloatingElements from './../components/FloatingElements';
import { Product } from '../page';

export default function Products() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'All Products',
    'Knives & Cutlery',
    'Cookware',
    'Appliances',
    'Utensils',
    'Bakeware'
  ];

  const allProducts: Product[] = [
    {
      id: 1,
      name: 'Professional Chef Knife Set',
      price: '189',
      image: '🔪',
      rating: 4.9,
      category: 'Knives & Cutlery',
      tag: 'Sale'
    },
    {
      id: 2,
      name: 'Commercial Blender',
      price: '156',
      image: '🥤',
      rating: 4.7,
      category: 'Appliances',
      tag: 'Popular'
    },
    {
      id: 3,
      name: 'Industrial Cookware Set',
      price: '267',
      image: '🍳',
      rating: 4.8,
      category: 'Cookware',
      tag: 'Sale'
    },
    {
      id: 4,
      name: 'Stainless Steel Mixing Bowls',
      price: '89',
      image: '🥣',
      rating: 4.6,
      category: 'Utensils',
      tag: 'New'
    },
    {
      id: 5,
      name: 'Professional Baking Set',
      price: '134',
      image: '🎂',
      rating: 4.7,
      category: 'Bakeware',
      tag: 'Sale'
    },
    {
      id: 6,
      name: 'Commercial Food Processor',
      price: '298',
      image: '⚙️',
      rating: 4.9,
      category: 'Appliances',
      tag: 'Popular'
    },
    {
      id: 7,
      name: 'Chef Knife Sharpener',
      price: '45',
      image: '⚔️',
      rating: 4.5,
      category: 'Knives & Cutlery',
      tag: 'Essential'
    },
    {
      id: 8,
      name: 'Non-Stick Pan Set',
      price: '178',
      image: '🍲',
      rating: 4.8,
      category: 'Cookware',
      tag: 'Sale'
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
      <FloatingElements />
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {/* Hero Section */}
      <section className="relative px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-6">
            Our <span className="text-orange-600">Premium</span> Collection
          </h1>
          <p className="text-xl text-amber-800 max-w-2xl mx-auto">
            Discover professional-grade kitchen equipment designed for culinary excellence and durability
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === 'All Products' ? 'all' : category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    (category === 'All Products' && selectedCategory === 'all') || 
                    selectedCategory === category
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white text-amber-900 hover:bg-orange-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full text-amber-900 font-medium hover:shadow-lg transition-all">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <div className="flex bg-white rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${
                    viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-amber-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${
                    viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-amber-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`${
                  viewMode === 'list' 
                    ? 'w-48 h-48 flex-shrink-0' 
                    : 'h-48'
                } bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative`}>
                  <div className="text-6xl">{product.image}</div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  </div>
                </div>

                <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                      <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">
                        {product.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-amber-700">{product.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-amber-900">{product.price} K</span>
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
    </div>
  );
}