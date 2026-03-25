export default function Loading() {
  return (
    <div className="container-wide py-10">
      {/* Hero skeleton */}
      <div className="bg-white border-b border-ink-200 -mx-4 px-4 py-16 mb-10">
        <div className="skeleton h-10 w-72 mb-4" />
        <div className="skeleton h-5 w-48 mb-6" />
        <div className="skeleton h-4 w-96 mb-2" />
        <div className="skeleton h-4 w-80" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card rounded-lg p-4">
            <div className="skeleton h-8 w-16 mx-auto mb-2" />
            <div className="skeleton h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="space-y-0 divide-y divide-ink-200">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="py-5 flex items-start gap-4">
            <div className="skeleton h-4 w-6" />
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                <div className="skeleton h-5 w-20" />
                <div className="skeleton h-5 w-16" />
              </div>
              <div className="skeleton h-5 w-full mb-2" />
              <div className="skeleton h-4 w-3/4" />
            </div>
            <div className="skeleton h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
