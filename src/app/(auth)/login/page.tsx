"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStaffCopy, normalizeStaffLocale, type StaffLocale } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<StaffLocale>("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy = getStaffCopy(language);

  useEffect(() => {
    setLanguage(normalizeStaffLocale(globalThis.navigator?.language));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error === "Email or password is incorrect." ? copy.invalidCredentials : payload.error ?? copy.unableToSignIn);
        return;
      }

      router.push("/catalog");
      router.refresh();
    } catch {
      setError(copy.unableToSignIn);
    } finally {
      setIsSubmitting(false);
    }
  }

  function applyDemoCredentials() {
    setEmail("admin@samplesale.local");
    setPassword("ChangeMe123!");
    setError("");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-30">
        <ThemeToggle compact language={language} />
      </div>
      <div className="grid w-full gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="relative overflow-hidden bg-ink px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="absolute inset-x-0 top-0 h-28 bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="brand-mark inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 text-2xl font-bold text-ink shadow-panel">
                <span className="brand-mark-letter font-serif">B</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/60">{copy.loginEyebrow}</p>
                <p className="mt-2 text-sm text-white/70">Bestseller Sample Sales</p>
              </div>
            </div>

            <h1 className="mt-10 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
              Secure staff sign-in for live sample sale operations.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
              Access the selling floor, manage checkout, resend receipts, and maintain country-specific catalog and tax settings from one authenticated workspace.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/55">Touch-first</p>
                <p className="mt-3 text-sm leading-6 text-white/85">Built for iPhone, iPad, and laptop workflows on the sales floor.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/55">Country-aware</p>
                <p className="mt-3 text-sm leading-6 text-white/85">Applies tax, currency, receipt, and language rules from saved user context.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/55">Auditable</p>
                <p className="mt-3 text-sm leading-6 text-white/85">Tracks admin changes, order creation, and receipt delivery across the app.</p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/55">Demo access</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
                    Keep this for internal review only. The sign-in form stays empty by default, and the demo account can be applied on demand.
                  </p>
                </div>
                <Button className="shrink-0" type="button" variant="secondary" onClick={applyDemoCredentials}>
                  Use demo credentials
                </Button>
              </div>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/82">
                <div className="grid gap-2 sm:grid-cols-2">
                  <p>Email: admin@samplesale.local</p>
                  <p>Password: ChangeMe123!</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/96 px-6 py-7 sm:px-8 sm:py-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-stone">{copy.login}</p>
              <h2 className="text-3xl font-semibold text-ink">{copy.signInTitle}</h2>
              <p className="max-w-md text-sm leading-6 text-stone">
                Sign in with your assigned local account. Microsoft 365 single sign-on can be layered in later without changing the staff workflow.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.24em] text-stone" htmlFor="email">
                {copy.emailLabel}
              </label>
              <Input
                id="email"
                autoComplete="email"
                type="email"
                placeholder="name@bestseller.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs uppercase tracking-[0.24em] text-stone" htmlFor="password">
                  {copy.passwordLabel}
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-ink underline underline-offset-4">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                autoComplete="current-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <Button className="w-full" disabled={isSubmitting} type="submit" variant="success">
              {isSubmitting ? copy.signingIn : copy.signIn}
            </Button>

            <div className="rounded-[24px] border border-black/5 bg-sand/40 p-4 text-sm leading-6 text-stone">
              <p>{copy.ssoRolloutPath}</p>
            </div>

            <div className="flex flex-col gap-3 border-t border-black/5 pt-2 text-sm text-stone sm:flex-row sm:items-center sm:justify-between">
              <p>
                Need a local account?{" "}
                <Link href="/register" className="font-medium text-ink underline underline-offset-4">
                  Register
                </Link>
              </p>
              <Link href="/catalog" className="font-medium text-ink underline underline-offset-4">
                {copy.openDemoCatalog}
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
