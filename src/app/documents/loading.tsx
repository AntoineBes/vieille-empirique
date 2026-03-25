export default function DocumentsLoading() {
  return (
    <div className="container-wide py-10">
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="skeleton h-4 w-96 mb-8" />

      {/* Filter bar skeleton */}
      <div className="bg-white border border-ink-200 rounded-lg p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton h-3 w-16 mb-2" />
              <div className="skeleton h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Results skeleton */}
      <div className="skeleton h-4 w-40 mb-6" />

      <div className="space-y-0 divide-y divide-ink-200">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="py-5 flex items-start gap-4">
            <div className="skeleton h-4 w-6" />
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                <div className="skeleton h-5 w-20" />
                <div className="skeleton h-5 w-16" />
              </div>
              <div className="skeleton h-5 w-full mb-2" />
              <div className="skeleton h-4 w-2/3" />
            </div>
            <div className="skeleton h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
