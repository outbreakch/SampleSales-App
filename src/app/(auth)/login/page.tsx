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
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.84fr] lg:items-center">
        <div className="px-2 sm:px-4 lg:px-8">
          <div className="space-y-4">
            <div className="max-w-[18rem] text-ink sm:max-w-[28rem]">
              <svg viewBox="0 0 147 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full">
                <path d="M69.6404 11.676C69.5787 13.8998 68.0366 16 64.9525 16C62.3618 16 60.1412 14.0851 60.0795 11.6143C60.5113 11.6143 62.4851 11.6143 62.8552 11.6143C62.9169 12.8497 63.7805 13.5909 65.2609 13.5292C66.6179 13.4674 67.2347 12.3555 67.2347 11.4289C67.2347 10.3788 67.0497 9.45227 64.1506 8.40216C61.6216 7.53736 60.3879 6.42549 60.3879 4.01641C60.3879 1.54557 62.6702 0.0630652 64.644 0.0012941C67.9133 -0.060477 69.4553 2.10151 69.3937 3.8311H66.6796C66.6179 2.90453 65.6927 2.28682 64.7057 2.28682C63.7188 2.28682 62.7319 2.96631 62.7319 4.20173C62.7319 5.62246 63.5954 6.11663 65.631 6.79611C69.1469 7.96976 69.7021 9.63758 69.6404 11.676Z" fill="currentColor" />
                <path d="M39.909 11.676C39.8473 13.8998 38.3052 16 35.2211 16C32.6303 16 30.4097 14.0851 30.3481 11.6143C30.7798 11.6143 32.7537 11.6143 33.1238 11.6143C33.1855 12.8497 34.0491 13.5909 35.5295 13.5292C36.8865 13.4674 37.5033 12.3555 37.5033 11.4289C37.5033 10.3788 37.3183 9.45227 34.4192 8.40216C31.8901 7.53736 30.6565 6.42549 30.6565 4.01641C30.6565 1.54557 32.9388 0.0630652 34.9126 0.0012941C38.1819 -0.060477 39.7239 2.10151 39.6623 3.8311H36.9482C36.8865 2.90453 35.9613 2.28682 34.9743 2.28682C33.9874 2.28682 33.0004 2.96631 33.0004 4.20173C33.0004 5.62246 33.864 6.11663 35.8996 6.79611C39.4772 7.96976 39.9707 9.63758 39.909 11.676Z" fill="currentColor" />
                <path d="M108.994 0.433716H106.65V15.4441H114.916V13.2821H109.118L108.994 13.2203V0.433716Z" fill="currentColor" />
                <path d="M94.8075 0.433716H92.4636V15.4441H100.667V13.2821H94.9309L94.8075 13.2203V0.433716Z" fill="currentColor" />
                <path d="M48.9148 2.71925L48.8532 2.5957H44.8437V0.433716H55.3916V2.5957H51.3822L51.3205 2.71925V15.4441H48.9148V2.71925Z" fill="currentColor" />
                <path d="M129.658 0.433716H121.455V15.4441H129.658V13.2821H123.86L123.799 13.2203V8.95812L123.86 8.89635H128.672V6.6726H123.86L123.799 6.54905V2.71925L123.86 2.5957H129.658V0.433716Z" fill="currentColor" />
                <path d="M84.6913 0.433716H76.4874V15.4441H84.6913V13.2821H78.9548L78.8314 13.2203V8.95812L78.9548 8.89635H83.7661V6.6726H78.9548L78.8314 6.54905V2.71925L78.9548 2.5957H84.6913V0.433716Z" fill="currentColor" />
                <path d="M24.2417 0.433716H16.0378V15.4441H24.2417V13.3439H18.4435L18.3818 13.2203V8.95812L18.4435 8.89635H23.2548V6.6726H18.4435L18.3818 6.54905V2.71925L18.4435 2.5957H24.2417V0.433716Z" fill="currentColor" />
                <path d="M140.823 0.433716C139.898 0.433716 137.616 0.433716 137.184 0.495487V15.4441H139.528C139.528 15.2588 139.528 9.08167 139.528 9.08167L139.651 8.95812H140.823C141.872 8.95812 142.304 9.6376 142.735 10.6877C143.352 12.1084 143.661 13.3439 144.277 15.4441H146.868C146.621 14.6411 145.758 12.0467 145.018 10.0082C144.586 8.83458 143.969 8.1551 143.291 7.96979V7.90802C144.524 7.41385 145.881 6.54905 145.943 4.32529C146.005 3.21341 145.758 2.22508 145.018 1.48382C144.154 0.680801 142.735 0.433716 140.823 0.433716ZM139.713 6.6726L139.59 6.54905V2.71925L139.713 2.5957H141.193C142.92 2.5957 143.537 3.70758 143.537 4.57238C143.537 6.30197 142.365 6.6726 141.193 6.6726H139.713Z" fill="currentColor" />
                <path d="M3.76269 0.433716C3.701 0.433716 3.63932 0.433716 3.63932 0.433716C2.71407 0.433716 0.431784 0.433716 0 0.495487V15.4441C0.493467 15.5059 2.77575 15.5676 3.76269 15.5676C6.16834 15.5676 7.03191 15.3205 8.01884 14.4557C8.75904 13.7763 9.19083 12.7262 9.19083 11.429C9.19083 9.20521 8.14221 8.21687 6.84686 7.7227V7.66093C7.83379 7.10499 8.63568 6.17843 8.63568 4.32529C8.63568 3.15164 8.26558 2.28685 7.52537 1.60737C6.53844 0.742572 5.36646 0.433716 3.76269 0.433716ZM2.40565 6.67259L2.28229 6.54905V2.71925L2.40565 2.5957C2.52902 2.5957 2.65239 2.5957 2.77575 2.5957C3.08417 2.5957 3.39259 2.5957 3.88605 2.5957C5.67487 2.5957 6.23002 3.4605 6.23002 4.51061C6.23002 5.8078 5.73656 6.67259 4.00942 6.67259C3.94774 6.67259 2.40565 6.67259 2.40565 6.67259ZM3.02249 13.3439C2.65239 13.3439 2.46734 13.3439 2.40565 13.3439L2.28229 13.2203V9.01989L2.40565 8.89635H3.88605C5.55151 8.89635 6.66181 9.69938 6.66181 11.2437C6.66181 12.4173 6.10666 13.3439 4.00942 13.3439C3.63932 13.3439 3.3309 13.3439 3.02249 13.3439Z" fill="currentColor" />
              </svg>
            </div>
            <p className="text-lg uppercase tracking-[0.28em] text-stone sm:text-xl">Sample Sales</p>
          </div>
        </div>

        <Card className="bg-white/96 px-6 py-7 sm:px-8 sm:py-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-stone">{copy.login}</p>
              <h2 className="text-3xl font-semibold text-ink">{copy.signInTitle}</h2>
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

            <div className="rounded-[24px] border border-black/5 bg-sand/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-stone">Demo access</p>
                  <div className="mt-2 space-y-1 text-sm text-stone">
                    <p>Email: admin@samplesale.local</p>
                    <p>Password: ChangeMe123!</p>
                  </div>
                </div>
                <Button className="shrink-0" type="button" variant="secondary" onClick={applyDemoCredentials}>
                  Use demo credentials
                </Button>
              </div>
            </div>

            <div className="border-t border-black/5 pt-2 text-sm text-stone">
              <p>
                Need a local account?{" "}
                <Link href="/register" className="font-medium text-ink underline underline-offset-4">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
