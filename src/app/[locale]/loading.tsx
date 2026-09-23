export default function Loading() {
  return (
    <>
      {/* Matches the horizon stage, which is dark in both themes. */}
      <div className="h-[calc(100svh-var(--header-h))] min-h-[26rem] bg-[#0e0c0b]" />

      <section className="mx-auto max-w-2xl animate-pulse px-4 py-20 sm:py-28">
        <div className="mb-8 h-16 w-16 rounded-sm bg-muted" />
        <div className="h-9 w-72 rounded bg-muted sm:h-10 sm:w-96" />
        <div className="mt-5 space-y-2">
          <div className="h-5 w-full rounded bg-muted" />
          <div className="h-5 w-4/6 rounded bg-muted" />
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="h-10 w-full rounded-md bg-muted sm:w-36" />
          <div className="h-10 w-full rounded-md bg-muted sm:w-32" />
        </div>
      </section>
    </>
  );
}
