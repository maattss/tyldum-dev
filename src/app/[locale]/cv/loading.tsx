export default function CVLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="animate-pulse space-y-12">
        {/* Header skeleton */}
        <div className="text-center pb-8 border-b border-border/50">
          <div className="h-10 w-48 bg-muted rounded mx-auto mb-2" />
          <div className="h-5 w-32 bg-muted rounded mx-auto mb-1" />
          <div className="h-4 w-24 bg-muted rounded mx-auto" />
        </div>

        {/* Summary skeleton */}
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>

        {/* Experience skeleton */}
        <div className="space-y-6">
          <div className="h-4 w-24 bg-muted rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="pl-6 border-l border-border/50 space-y-2">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
