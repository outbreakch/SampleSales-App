import { headers } from "next/headers";
import { resolveStaffLocaleFromHeader } from "@/lib/i18n";
import { ResetPasswordClient } from "./reset-password-client";

export default async function ResetPasswordPage() {
  const acceptLanguage = (await headers()).get("accept-language");
  const initialLanguage = resolveStaffLocaleFromHeader(acceptLanguage);

  return <ResetPasswordClient initialLanguage={initialLanguage} />;
}
