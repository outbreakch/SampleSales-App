import { headers } from "next/headers";
import { resolveStaffLocaleFromHeader } from "@/lib/i18n";
import { RegisterClient } from "./register-client";

export default async function RegisterPage() {
  const acceptLanguage = (await headers()).get("accept-language");
  const initialLanguage = resolveStaffLocaleFromHeader(acceptLanguage);

  return <RegisterClient initialLanguage={initialLanguage} />;
}
