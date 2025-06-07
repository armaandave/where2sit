export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Best Seat Finder</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Screen Info Skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 w-96 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>

          {/* Seat Map Skeleton */}
          <div className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6">
            <div className="py-8 text-center">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center gap-3 bg-gray-100 rounded-lg px-6 py-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 