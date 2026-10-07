import { COLUMN } from "@/lib/layout";

export default function CVLoading() {
  return (
    <div className={`${COLUMN} animate-pulse py-12 sm:py-16`}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="h-10 w-64 rounded bg-muted" />
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>
        <div className="h-[88px] w-[88px] shrink-0 rounded-[14px] bg-muted" />
      </div>
      <div className="mt-12 space-y-2">
        <div className="h-5 w-full rounded bg-muted" />
        <div className="h-5 w-3/4 rounded bg-muted" />
      </div>
      <div className="mt-12 space-y-7">
        <div className="h-5 w-28 rounded bg-muted" />
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-6 w-2/3 rounded bg-muted" />
            <div className="h-5 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
