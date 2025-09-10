export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title skeleton */}
          <div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8"></div>
          
          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            
            {/* Cards skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="mt-4 h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="mt-auto bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}