export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-16 lg:px-8">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-secondary" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="aspect-[4/3] animate-pulse rounded-xl bg-secondary"
          />
        ))}
      </div>
    </main>
  );
}
