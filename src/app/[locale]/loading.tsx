export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        <div className="mb-8 animate-pulse">
          {/* Matches the hero avatar: rounded-2xl, 144px mobile / 176px desktop. */}
          <div className="mx-auto h-36 w-36 rounded-2xl bg-muted sm:h-44 sm:w-44" />
        </div>

        <div className="w-full max-w-xl animate-pulse space-y-6">
          {/* Name */}
          <div className="mx-auto h-14 w-72 rounded bg-muted sm:h-16 sm:w-96" />
          {/* Tagline */}
          <div className="mx-auto h-7 w-56 rounded bg-muted sm:h-8" />
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
    </div>
  );
}
