/**
 * Minimal fallback for route-level Suspense (code splitting).
 * Kept small so it doesn't pull in heavy deps and first paint stays fast.
 */
export function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
