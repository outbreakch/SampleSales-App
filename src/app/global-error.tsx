"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-sand px-6 py-10 text-ink">
        <main className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-white/95 p-8 shadow-[0_24px_80px_rgba(19,23,18,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-stone">Critical Error</p>
          <h1 className="mt-3 text-4xl font-semibold">The application could not render.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone">
            A critical rendering failure occurred before the normal app shell could load.
          </p>
          {error?.digest ? <p className="mt-4 text-sm text-stone">Reference: {error.digest}</p> : null}
          <div className="mt-8">
            <button
              className="inline-flex items-center rounded-full bg-success px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              onClick={() => reset()}
              type="button"
            >
              Reload application
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
