"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStaffCopy, normalizeStaffLocale, type StaffLocale } from "@/lib/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<StaffLocale>("en");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? copy.unableToSignIn);
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

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="fixed right-4 top-4 z-30">
        <ThemeToggle compact language={language} />
      </div>
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-ink text-white">
          <p className="text-xs uppercase tracking-[0.32em] text-white/60">{copy.loginEyebrow}</p>
          <h1 className="mt-4 font-serif text-4xl">Create your staff account</h1>
          <p className="mt-4 max-w-md text-white/70">
            Register a real local-auth account, then set your country and language preferences after your first sign-in.
          </p>
          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-white/75">
            Local account access
            <div className="mt-2 space-y-1 text-white">
              <p>Staff users start with the `STAFF` role.</p>
              <p>Admins can promote, disable, or reset users from the app.</p>
            </div>
          </div>
        </Card>
        <Card className="bg-white/96">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone">Register</p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">Create an account</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
              <Input placeholder="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </div>
            <Input type="email" placeholder={copy.emailLabel} value={email} onChange={(event) => setEmail(event.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="password" placeholder={copy.passwordLabel} value={password} onChange={(event) => setPassword(event.target.value)} />
              <Input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button className="w-full" disabled={isSubmitting} type="submit" variant="success">
              {isSubmitting ? copy.creating : "Create account"}
            </Button>
            <p className="text-sm text-stone">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-ink underline underline-offset-4">
                {copy.login}
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
