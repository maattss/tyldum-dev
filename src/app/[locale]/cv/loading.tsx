export default function CVLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="animate-pulse space-y-12">
        {/* Header skeleton */}
        <header className="border-b border-border pb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="h-10 w-48 bg-muted rounded mb-2" />
              <div className="h-5 w-32 bg-muted rounded mb-3" />
              <div className="h-4 w-24 bg-muted rounded mb-4" />
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>

            {/* Profile picture skeleton */}
            <div className="print:hidden shrink-0">
              <div className="h-28 w-28 bg-muted rounded-2xl" />
            </div>
          </div>
        </header>

        {/* Summary skeleton */}
        <section className="max-w-3xl space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </section>

        {/* Experience skeleton */}
        <section className="space-y-6">
          <div className="h-4 w-24 bg-muted rounded mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-l-2 border-border pl-5 space-y-2">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
