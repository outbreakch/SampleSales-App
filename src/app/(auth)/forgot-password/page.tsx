"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setError(payload.error ?? "Unable to send reset instructions.");
        return;
      }

      setMessage(payload.message ?? "If an account exists for that email, a reset link has been sent.");
    } catch {
      setError("Unable to send reset instructions.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-30">
        <ThemeToggle compact language="en" />
      </div>
      <Card className="w-full bg-white/96 px-6 py-7 sm:px-8 sm:py-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-stone">Password reset</p>
            <h1 className="text-3xl font-semibold text-ink">Reset your password</h1>
            <p className="max-w-xl text-sm leading-6 text-stone">
              Enter your account email address. If it exists, the app will send a one-time reset link that expires in 60 minutes.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-stone" htmlFor="email">
              Email
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
            {isSubmitting ? "Sending reset link..." : "Send reset link"}
          </Button>

          <p className="text-sm text-stone">
            Remembered your password?{" "}
            <Link href="/login" className="font-medium text-ink underline underline-offset-4">
              Back to login
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
