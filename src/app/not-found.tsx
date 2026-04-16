import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-sand px-6 py-10 text-ink">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-white/95 p-8 shadow-[0_24px_80px_rgba(19,23,18,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-stone">Not Found</p>
        <h1 className="mt-3 text-4xl font-semibold">This page does not exist.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone">
          The route may have been removed, renamed, or the link may be invalid.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center rounded-full bg-success px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            href="/catalog"
          >
            Go to catalog
          </Link>
          <Link
            className="inline-flex items-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mist/60"
            href="/login"
          >
            Go to login
          </Link>
        </div>
      </div>
    </main>
  );
}
