// app/products/[id]/loading.tsx
export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse">
          {/* Back button skeleton */}
          <div className="h-6 bg-amber-200 rounded-full w-24 mb-8"></div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="h-96 bg-amber-200 rounded-3xl"></div>
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-amber-200 rounded-xl"></div>
                ))}
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-amber-200 rounded w-3/4"></div>
              <div className="h-6 bg-amber-200 rounded w-1/2"></div>
              <div className="h-12 bg-amber-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-amber-200 rounded"></div>
                <div className="h-4 bg-amber-200 rounded w-5/6"></div>
                <div className="h-4 bg-amber-200 rounded w-4/6"></div>
              </div>
              <div className="h-14 bg-amber-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}