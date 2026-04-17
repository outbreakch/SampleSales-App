import { headers } from "next/headers";
import { resolveStaffLocaleFromHeader } from "@/lib/i18n";
import { LoginClient } from "./login-client";

export default async function LoginPage() {
  const acceptLanguage = (await headers()).get("accept-language");
  const initialLanguage = resolveStaffLocaleFromHeader(acceptLanguage);

  return <LoginClient initialLanguage={initialLanguage} />;
}
