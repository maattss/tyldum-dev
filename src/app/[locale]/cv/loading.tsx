export default function CVLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="animate-pulse space-y-16">
        <header className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="h-12 w-72 rounded bg-muted sm:h-14 sm:w-96" />
            <div className="mt-3 h-6 w-44 rounded bg-muted" />
            <div className="mt-5 h-4 w-56 rounded bg-muted" />
          </div>

          {/* Profile picture skeleton */}
          <div className="h-24 w-24 shrink-0 rounded-sm bg-muted sm:h-28 sm:w-28 print:hidden" />
        </header>

        <section className="max-w-2xl space-y-2">
          <div className="h-6 w-full rounded bg-muted" />
          <div className="h-6 w-5/6 rounded bg-muted" />
        </section>

        <section>
          <div className="mb-6 h-8 w-40 rounded bg-muted" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="grid gap-x-8 gap-y-2 border-t border-border py-5 sm:grid-cols-[9rem_1fr]"
            >
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
