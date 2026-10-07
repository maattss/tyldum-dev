import { COLUMN } from "@/lib/layout";

export default function Loading() {
  return (
    <div className={`${COLUMN} animate-pulse`}>
      <section className="pt-16 pb-14 sm:pt-24">
        {/* Avatar, name, tagline, intro: same boxes as the hero. */}
        <div className="mb-8 h-[88px] w-[88px] rounded-[14px] bg-muted" />
        <div className="h-10 w-72 rounded bg-muted sm:h-[52px] sm:w-96" />
        <div className="mt-5 h-6 w-56 rounded bg-muted" />
        <div className="mt-4 space-y-2">
          <div className="h-5 w-full rounded bg-muted" />
          <div className="h-5 w-4/6 rounded bg-muted" />
        </div>
      </section>
      <div className="space-y-3.5 pb-24">
        <div className="h-5 w-32 rounded bg-muted" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-6 w-5/6 rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}
