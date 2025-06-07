export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Best Seat Finder</h1>
        </div>

        <div className="max-w-4xl mx-auto pb-8">
          <div className="mb-8 text-center">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full max-w-lg p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-lg p-8">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 