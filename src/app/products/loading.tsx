// app/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-8 bg-amber-200 rounded-full w-64 mb-8"></div>
          
          {/* Filters skeleton */}
          <div className="flex gap-4 mb-8">
            <div className="h-12 bg-amber-200 rounded-full w-48"></div>
            <div className="h-12 bg-amber-200 rounded-full w-32"></div>
          </div>
          
          {/* Products grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="h-48 bg-amber-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-amber-200 rounded mb-2"></div>
                <div className="h-4 bg-amber-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-amber-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}