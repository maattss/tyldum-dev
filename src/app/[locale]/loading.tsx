export default function Loading() {
  return (
    <div className="container mx-auto px-4">
      <section className="flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center animate-pulse">
        {/* Profile image skeleton */}
        <div className="mb-8">
          <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-background sm:h-44 sm:w-44 bg-muted" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-6 w-full max-w-2xl">
          {/* Greeting skeleton */}
          <div className="h-6 w-32 bg-muted rounded mx-auto" />

          {/* Name skeleton */}
          <div className="h-16 w-64 bg-muted rounded mx-auto" />

          {/* Tagline skeleton */}
          <div className="h-8 w-72 bg-muted rounded mx-auto" />

          {/* Description skeleton */}
          <div className="mx-auto max-w-lg space-y-2">
            <div className="h-5 w-full bg-muted rounded" />
            <div className="h-5 w-5/6 bg-muted rounded" />
            <div className="h-5 w-4/6 bg-muted rounded" />
          </div>
        </div>

        {/* Social links skeleton */}
        <div className="mt-10">
          <div className="flex gap-4 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-10 bg-muted rounded-full" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
