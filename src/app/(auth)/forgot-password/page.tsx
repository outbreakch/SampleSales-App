import { headers } from "next/headers";
import { resolveStaffLocaleFromHeader } from "@/lib/i18n";
import { ForgotPasswordClient } from "./forgot-password-client";

export default async function ForgotPasswordPage() {
  const acceptLanguage = (await headers()).get("accept-language");
  const initialLanguage = resolveStaffLocaleFromHeader(acceptLanguage);

  return <ForgotPasswordClient initialLanguage={initialLanguage} />;
}
