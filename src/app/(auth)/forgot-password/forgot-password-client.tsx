"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthPageControls } from "@/components/auth/auth-page-controls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStaffCopy, normalizeStaffLocale, type StaffLocale } from "@/lib/i18n";

export function ForgotPasswordClient({ initialLanguage }: { initialLanguage: StaffLocale }) {
  const [language, setLanguage] = useState<StaffLocale>(normalizeStaffLocale(initialLanguage));
  const [email, setEmail] = useState("");
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
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? copy.unableToSendResetInstructions);
        return;
      }

      setMessage(payload.message ?? copy.resetLinkSent);
    } catch {
      setError(copy.unableToSendResetInstructions);
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
            <p className="text-xs uppercase tracking-[0.28em] text-stone">{copy.forgotPasswordEyebrow}</p>
            <h1 className="text-3xl font-semibold text-ink">{copy.forgotPasswordTitle}</h1>
            <p className="max-w-xl text-sm leading-6 text-stone">{copy.forgotPasswordDescription}</p>
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

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="rounded-2xl bg-success/10 px-4 py-3 text-sm text-success">{message}</p> : null}

          <Button className="w-full" disabled={isSubmitting} type="submit" variant="success">
            {isSubmitting ? copy.sendingResetLink : copy.sendResetLink}
          </Button>

          <p className="text-sm text-stone">
            {copy.rememberedPassword}{" "}
            <Link href="/login" className="font-medium text-ink underline underline-offset-4">
              {copy.backToLogin}
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
