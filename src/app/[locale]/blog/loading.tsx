export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="h-10 w-32 bg-muted rounded mb-8 animate-pulse" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-6 animate-pulse space-y-4"
          >
            <div className="h-6 w-3/4 bg-muted rounded" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-5/6 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
