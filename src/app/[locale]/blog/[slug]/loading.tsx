export default function BlogPostLoading() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-16">
      <div className="animate-pulse">
        <div className="h-9 w-32 bg-muted rounded mb-8" />

        <header className="mb-8 space-y-4">
          <div className="h-10 w-3/4 bg-muted rounded" />
          <div className="h-6 w-full bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </header>

        <div className="h-px bg-border mb-8" />

        <div className="space-y-4">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-4/5 bg-muted rounded" />
        </div>
      </div>
    </article>
  );
}
