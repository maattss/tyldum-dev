export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center justify-center px-4 pt-16 pb-14 text-center sm:pt-24 sm:pb-16">
        <div className="mb-8 animate-pulse">
          {/* Matches the hero avatar: rounded-2xl, 144px mobile / 176px desktop. */}
          <div className="mx-auto h-36 w-36 rounded-2xl bg-muted sm:h-44 sm:w-44" />
        </div>

        <div className="w-full max-w-xl animate-pulse space-y-6">
          {/* Name */}
          <div className="mx-auto h-14 w-72 rounded bg-muted sm:h-16 sm:w-96" />
          {/* Tagline and location */}
          <div className="space-y-2">
            <div className="mx-auto h-7 w-56 rounded bg-muted sm:h-8" />
            <div className="mx-auto h-5 w-28 rounded bg-muted" />
          </div>
          {/* Description */}
          <div className="mx-auto max-w-xl space-y-2">
            <div className="h-5 w-full rounded bg-muted" />
            <div className="mx-auto h-5 w-4/6 rounded bg-muted" />
          </div>
        </div>

        {/* Two wide social buttons, stacked on mobile. */}
        <div className="mt-10 flex w-full animate-pulse flex-col items-center gap-4 sm:w-auto sm:flex-row">
          <div className="h-10 w-full rounded-md bg-muted sm:w-36" />
          <div className="h-10 w-full rounded-md bg-muted sm:w-32" />
        </div>
      </section>

      {/* Experience and toolbox panels. */}
      <div className="mx-auto grid max-w-5xl animate-pulse gap-6 pb-20 md:grid-cols-5 sm:pb-28">
        <div className="h-80 rounded-2xl border border-border/80 bg-muted/40 md:col-span-3" />
        <div className="h-80 rounded-2xl border border-border/80 bg-muted/40 md:col-span-2" />
      </div>
    </div>
  );
}
