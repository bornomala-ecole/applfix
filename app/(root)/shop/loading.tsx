export default function Loading() {
  return (
    <div className="container py-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-56 rounded bg-gray-200" />
          <div className="h-4 w-96 max-w-full rounded bg-gray-200" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
            <div className="h-[640px] rounded-3xl bg-gray-100" />
            <div className="space-y-4">
              <div className="h-16 rounded-3xl bg-gray-100" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-72 rounded-3xl bg-gray-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}