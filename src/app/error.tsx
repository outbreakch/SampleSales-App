"use client";

import Link from "next/link";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-sand px-6 py-10 text-ink">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-white/95 p-8 shadow-[0_24px_80px_rgba(19,23,18,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-stone">Application Error</p>
        <h1 className="mt-3 text-4xl font-semibold">Something went wrong.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone">
          The app hit an unexpected error while rendering this page. Try the action again or go back to a stable route.
        </p>
        {error?.digest ? (
          <p className="mt-4 text-sm text-stone">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center rounded-full bg-success px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            onClick={() => reset()}
            type="button"
          >
            Try again
          </button>
          <Link
            className="inline-flex items-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mist/60"
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
