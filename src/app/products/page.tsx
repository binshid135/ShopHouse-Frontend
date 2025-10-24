"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Grid, List, Star, ShoppingCart } from 'lucide-react';
import Header from './../components/Header'
import FloatingElements from './../components/FloatingElements';

interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  originalPrice: number;
  discountedPrice: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export default function Products() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'All Products',
    'Knives & Cutlery',
    'Cookware',
    'Appliances',
    'Utensils',
    'Bakeware'
  ];

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

  // Add this new state
  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);

  const addToCart = async (productId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation

    try {
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
        alert('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Error adding to cart');
    }
  };


  const navigateToProduct = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ||
      product.name.toLowerCase().includes(selectedCategory.toLowerCase().replace(' & ', ' '));

    return matchesSearch && matchesCategory;
  });

  // Calculate discount percentage
  const getDiscountPercentage = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  // Get product emoji based on name or category
  const getProductEmoji = (product: Product) => {
    const name = product.name.toLowerCase();
    if (name.includes('knife') || name.includes('cutlery')) return '🔪';
    if (name.includes('blender') || name.includes('processor') || name.includes('appliance')) return '🥤';
    if (name.includes('cookware') || name.includes('pan') || name.includes('pot')) return '🍳';
    if (name.includes('bowl') || name.includes('utensil')) return '🥣';
    if (name.includes('baking') || name.includes('bakeware')) return '🎂';
    if (name.includes('mixer') || name.includes('tool')) return '⚙️';
    if (name.includes('sharpener')) return '⚔️';
    return '🍴';
  };

  // Get product tag based on discount
  const getProductTag = (product: Product) => {
    const discount = getDiscountPercentage(product.originalPrice, product.discountedPrice);
    if (discount > 20) return 'Sale';
    if (discount > 0) return 'Discount';
    return 'New';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 overflow-hidden">
        <FloatingElements />
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
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
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === 'All Products' ? 'all' : category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${(category === 'All Products' && selectedCategory === 'all') ||
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
                  className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-amber-900'
                    }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-amber-900'
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Count */}
          <div className="mb-6">
            <p className="text-amber-700">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-amber-800">No products found matching your criteria.</p>
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

                return (
                  <div
                    key={product.id}
                    onClick={() => navigateToProduct(product.id)}
                    className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'flex' : ''
                      }`}
                  >
                    <div className={`${viewMode === 'list'
                        ? 'w-48 h-48 flex-shrink-0'
                        : 'h-48'
                      } bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative`}>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-6xl">{productEmoji}</div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                        <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                        <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                      </div>
                      {discountPercentage > 0 && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                          -{discountPercentage}%
                        </div>
                      )}
                    </div>

                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                            {productTag}
                          </span>
                          {discountPercentage > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                              Save ${(product.originalPrice - product.discountedPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-amber-900 mb-2">{product.name}</h3>
                        {product.shortDescription && (
                          <p className="text-amber-700 text-sm mb-3 line-clamp-2">
                            {product.shortDescription}
                          </p>
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
                            ${product.discountedPrice.toFixed(2)}
                          </span>
                          {product.originalPrice > product.discountedPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => addToCart(product.id, e)}
                          className={`p-3 rounded-full transition-all transform hover:scale-110 ${addedProductIds.includes(product.id)
                              ? 'bg-green-500 text-white shadow-lg'
                              : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-lg'
                            }`}
                        >
                          {addedProductIds.includes(product.id) ? '✓ Added' : <ShoppingCart className="w-5 h-5" />}
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
    </div>
  );
}