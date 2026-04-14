"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

          setError(firstFieldError ?? "Unable to reset password.");
        }
        return;
      }

      setMessage("Password updated. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError("Unable to reset password.");
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
            <h1 className="text-3xl font-semibold text-ink">Choose a new password</h1>
            <p className="max-w-xl text-sm leading-6 text-stone">
              Use a strong password with at least 12 characters, including uppercase, lowercase, number, and symbol.
            </p>
          </div>

          {!token ? (
            <div className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
              This reset link is incomplete. Request a new one from the forgot password page.
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-stone" htmlFor="password">
              New password
            </label>
            <Input
              id="password"
              autoComplete="new-password"
              type="password"
              placeholder="Enter a strong password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-stone" htmlFor="confirmPassword">
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              autoComplete="new-password"
              type="password"
              placeholder="Re-enter the password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {message ? <p className="rounded-2xl bg-success/10 px-4 py-3 text-sm text-success">{message}</p> : null}

          <Button className="w-full" disabled={isSubmitting || !token} type="submit" variant="success">
            {isSubmitting ? "Updating password..." : "Update password"}
          </Button>

          <p className="text-sm text-stone">
            Need another reset link?{" "}
            <Link href="/forgot-password" className="font-medium text-ink underline underline-offset-4">
              Request a new one
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
