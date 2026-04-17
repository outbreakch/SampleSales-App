"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthPageControls } from "@/components/auth/auth-page-controls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStaffCopy, normalizeStaffLocale, type StaffLocale } from "@/lib/i18n";

export function ResetPasswordClient({ initialLanguage }: { initialLanguage: StaffLocale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [language, setLanguage] = useState<StaffLocale>(normalizeStaffLocale(initialLanguage));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy = getStaffCopy(language);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-reset/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        })
      });

      const payload = (await response.json()) as { error?: string | { fieldErrors?: Record<string, string[]> } };

      if (!response.ok) {
        if (typeof payload.error === "string") {
          setError(payload.error);
        } else {
          const fieldErrors = payload.error?.fieldErrors ?? {};
          const firstFieldError =
            fieldErrors.password?.[0] ??
            fieldErrors.confirmPassword?.[0] ??
            Object.values(fieldErrors).flat()[0];

          setError(firstFieldError ?? copy.unableToResetPassword);
        }
        return;
      }

      setMessage(copy.passwordUpdatedRedirecting);
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError(copy.unableToResetPassword);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <AuthPageControls language={language} onLanguageChange={setLanguage} />
      <Card className="w-full bg-white/96 px-6 py-7 sm:px-8 sm:py-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-stone">{copy.resetPasswordEyebrow}</p>
            <h1 className="text-3xl font-semibold text-ink">{copy.resetPasswordTitle}</h1>
            <p className="max-w-xl text-sm leading-6 text-stone">{copy.resetPasswordDescription}</p>
          </div>

          {!token ? <div className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{copy.resetLinkIncomplete}</div> : null}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-stone" htmlFor="password">
              {copy.newPasswordLabel}
            </label>
            <Input
              id="password"
              autoComplete="new-password"
              type="password"
              placeholder={copy.newPasswordPlaceholder}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-stone" htmlFor="confirmPassword">
              {copy.confirmPasswordLabel}
            </label>
            <Input
              id="confirmPassword"
              autoComplete="new-password"
              type="password"
              placeholder={copy.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="rounded-2xl bg-success/10 px-4 py-3 text-sm text-success">{message}</p> : null}

          <Button className="w-full" disabled={isSubmitting || !token} type="submit" variant="success">
            {isSubmitting ? copy.updatingPassword : copy.updatePassword}
          </Button>

          <p className="text-sm text-stone">
            {copy.needAnotherResetLink}{" "}
            <Link href="/forgot-password" className="font-medium text-ink underline underline-offset-4">
              {copy.requestNewResetLink}
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
