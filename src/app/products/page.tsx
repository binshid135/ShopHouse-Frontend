// app/products/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Grid, List, Star, ShoppingCart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './../components/Header'
import FloatingElements from './../components/FloatingElements';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';

interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  originalPrice: number;
  discountedPrice: number;
  images: string[];
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export default function Products() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{[key: string]: number}>({});

  useEffect(() => {
    fetchProducts();
  }, []);

 const fetchProducts = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/userside/products');
    if (response.ok) {
      const data = await response.json();
      setProducts(data);
      
      // Extract unique categories, filter out "Uncategorized" and empty categories
      const uniqueCategories = ['All', ...new Set(
        data
          .map((product: Product) => product.category)
          .filter((category: string | null | undefined) => 
            category && category !== 'Uncategorized' && category.trim() !== ''
          )
      )] as string[];
      
      setCategories(uniqueCategories);
      
      // Initialize image indexes for each product
      const indexes: {[key: string]: number} = {};
      data.forEach((product: Product) => {
        indexes[product.id] = 0;
      });
      setCurrentImageIndexes(indexes);
    } else {
      setError('Failed to fetch products');
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    setError('Error loading products');
  } finally {
    setLoading(false);
  }
};
  const addToCart = async (productId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation

    try {
      const product = products.find(p => p.id === productId);
      
      // Check stock availability
      if (product && product.stock <= 0) {
        alert('This product is out of stock');
        return;
      }

      // Check if product has low stock
      if (product && product.stock < 5) {
        const confirmAdd = window.confirm(
          `Only ${product.stock} items left in stock. Continue adding to cart?`
        );
        if (!confirmAdd) return;
      }

      const response = await fetch('/api/userside/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // Mark as added
        setAddedProductIds((prev) => [...prev, productId]);

        // Auto-remove after 2 seconds
        setTimeout(() => {
          setAddedProductIds((prev) => prev.filter((id) => id !== productId));
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Error adding to cart');
    }
  };

  const navigateToProduct = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  // Image carousel navigation
  const nextImage = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const product = products.find(p => p.id === productId);
    if (!product || product.images.length <= 1) return;
    
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: (prev[productId] + 1) % product.images.length
    }));
  };

  const prevImage = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const product = products.find(p => p.id === productId);
    if (!product || product.images.length <= 1) return;
    
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: (prev[productId] - 1 + product.images.length) % product.images.length
    }));
  };

  // Filter products based on search query and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate discount percentage
  const getDiscountPercentage = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  // Get product emoji based on name or category
  const getProductEmoji = (product: Product) => {
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    
    if (name.includes('knife') || name.includes('cutlery') || category.includes('knife')) return '🔪';
    if (name.includes('blender') || name.includes('processor') || name.includes('appliance') || category.includes('appliance')) return '🥤';
    if (name.includes('cookware') || name.includes('pan') || name.includes('pot') || category.includes('cookware')) return '🍳';
    if (name.includes('bowl') || name.includes('utensil') || category.includes('utensil')) return '🥣';
    if (name.includes('baking') || name.includes('bakeware') || category.includes('baking')) return '🎂';
    if (name.includes('mixer') || name.includes('tool') || category.includes('tool')) return '⚙️';
    if (name.includes('sharpener') || category.includes('sharpener')) return '⚔️';
    return '🍴';
  };

  // Get product tag based on discount and stock
  const getProductTag = (product: Product) => {
    if (product.stock <= 0) return 'Out of Stock';
    
    const discount = getDiscountPercentage(product.originalPrice, product.discountedPrice);
    if (discount > 20) return 'Sale';
    if (discount > 0) return 'Discount';
    if (product.stock < 5) return 'Low Stock';
    return 'New';
  };

  // Get stock status badge
  const getStockBadge = (product: Product) => {
    if (product.stock <= 0) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
          Out of Stock
        </span>
      );
    }
    
    if (product.stock < 5) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">
          Only {product.stock} left
        </span>
      );
    }
    
    return null;
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'electronics':
      case 'appliances':
        return '⚡';
      case 'cookware':
        return '🍳';
      case 'cutlery':
        return '🔪';
      case 'baking':
        return '🎂';
      case 'utensils':
        return '🥄';
      case 'tools':
        return '🛠️';
      case 'storage':
        return '📦';
      default:
        return '🏷️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
        <FloatingElements />
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
        <FloatingElements />
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl text-amber-800 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            {/* Search Field */}
            <div className="w-full md:w-auto">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-3 rounded-full border border-amber-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-amber-900 placeholder-amber-400 shadow-sm"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-2 bg-white px-4 py-3 rounded-full border border-amber-200 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-amber-900 font-medium transition-all shadow-sm hover:shadow-md"
                >
                  <Filter className="w-4 h-4" />
                  <span>
                    {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
                  </span>
                  <div className={`transform transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Category Dropdown */}
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-amber-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-amber-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-amber-900">Categories</h3>
                        <button
                          onClick={() => setShowCategoryDropdown(false)}
                          className="p-1 hover:bg-amber-100 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-orange-50 ${
                            selectedCategory === category ? 'bg-orange-50 text-orange-600' : 'text-amber-700'
                          }`}
                        >
                          <span className="text-lg">
                            {category === 'All' ? '📦' : getCategoryIcon(category)}
                          </span>
                          <span className="font-medium">
                            {category === 'All' ? 'All Categories' : category}
                          </span>
                          {selectedCategory === category && (
                            <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-white rounded-full p-1 border border-amber-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${
                    viewMode === 'list' 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters and Products Count */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <p className="text-amber-700">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              
              {/* Active Category Badge */}
              {selectedCategory !== 'All' && (
                <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                  <span>{getCategoryIcon(selectedCategory)}</span>
                  <span>{selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="hover:text-orange-900 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {/* Active Search Badge */}
              {searchQuery && (
                <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                  <span>🔍</span>
                  <span>"{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-amber-900 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Clear All Filters Button */}
            {(selectedCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="text-sm bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors shadow-sm"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Category Quick Filters */}
          {categories.length > 1 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                        selectedCategory === category
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-white text-amber-700 border border-amber-200 hover:border-orange-300 hover:shadow-sm'
                      }`}
                    >
                      <span className="text-sm">
                        {category === 'All' ? '📦' : getCategoryIcon(category)}
                      </span>
                      <span className="font-medium text-sm">
                        {category === 'All' ? 'All' : category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">No products found</h3>
              <p className="text-amber-700 mb-6 max-w-md mx-auto">
                {searchQuery || selectedCategory !== 'All' 
                  ? `We couldn't find any products matching your criteria. Try adjusting your filters.` 
                  : "No products are currently available."}
              </p>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition-colors shadow-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
              }`}>
              {filteredProducts.map((product) => {
                const discountPercentage = getDiscountPercentage(product.originalPrice, product.discountedPrice);
                const productEmoji = getProductEmoji(product);
                const productTag = getProductTag(product);
                const stockBadge = getStockBadge(product);
                const isOutOfStock = product.stock <= 0;
                const currentImageIndex = currentImageIndexes[product.id] || 0;
                const hasMultipleImages = product.images && product.images.length > 1;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && navigateToProduct(product.id)}
                    className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transform transition-all duration-300 cursor-pointer ${
                      isOutOfStock 
                        ? 'opacity-60 cursor-not-allowed' 
                        : 'hover:-translate-y-2'
                    } ${viewMode === 'list' ? 'flex' : ''}`}
                  >
                    <div className={`${viewMode === 'list'
                        ? 'w-48 h-48 flex-shrink-0'
                        : 'h-48'
                      } bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative group`}>
                      
                      {/* Product Image or Slideshow */}
                      {product.images && product.images.length > 0 ? (
                        <>
                          <img
                            src={product.images[currentImageIndex]}
                            alt={product.name}
                            className="w-full h-full object-contain transition-opacity duration-300"
                          />
                          
                          {/* Navigation Arrows for Multiple Images */}
                          {hasMultipleImages && (
                            <>
                              <button
                                onClick={(e) => prevImage(product.id, e)}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-amber-900 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => nextImage(product.id, e)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-amber-900 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {/* Image Dots Indicator */}
                          {hasMultipleImages && (
                            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                              {product.images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndexes(prev => ({
                                      ...prev,
                                      [product.id]: index
                                    }));
                                  }}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentImageIndex
                                      ? 'bg-orange-500'
                                      : 'bg-white/80 hover:bg-white'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Image Counter */}
                          {hasMultipleImages && (
                            <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              {currentImageIndex + 1} / {product.images.length}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-6xl">{productEmoji}</div>
                      )}
                      
                      {/* Top Right Discount Badge */}
                      {discountPercentage > 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                          -{discountPercentage}%
                        </div>
                      )}
                    </div>

                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            productTag === 'Out of Stock' 
                              ? 'bg-red-100 text-red-600'
                              : productTag === 'Low Stock'
                              ? 'bg-yellow-100 text-yellow-600'
                              : productTag === 'Sale'
                              ? 'bg-red-100 text-red-600'
                              : productTag === 'Discount'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {productTag}
                          </span>
                          {discountPercentage > 0 && productTag !== 'Out of Stock' && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                              Save AED{(product.originalPrice - product.discountedPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        {/* Category Badge */}
                        {product.category && product.category !== 'Uncategorized' && (
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              <span>{getCategoryIcon(product.category)}</span>
                              {product.category}
                            </span>
                          </div>
                        )}
                        
                        <h3 className="text-xl font-bold text-amber-900 mb-2">{product.name}</h3>
                        {product.shortDescription && (
                          <p className="text-amber-700 text-sm mb-3 line-clamp-2">
                            {product.shortDescription}
                          </p>
                        )}
                        
                        {/* Stock Status */}
                        {stockBadge && (
                          <div className="mb-3">
                            {stockBadge}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium text-amber-700">4.8</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-amber-900">
                            AED{product.discountedPrice.toFixed(2)}
                          </span>
                          {product.originalPrice > product.discountedPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              AED{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOutOfStock) {
                              addToCart(product.id, e);
                            }
                          }}
                          disabled={isOutOfStock}
                          className={`p-3 rounded-full transition-all transform ${
                            isOutOfStock
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : addedProductIds.includes(product.id)
                              ? 'bg-green-500 text-white shadow-lg hover:scale-110'
                              : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-lg hover:scale-110'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : 
                           addedProductIds.includes(product.id) ? '✓ Added' : <ShoppingCart className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}