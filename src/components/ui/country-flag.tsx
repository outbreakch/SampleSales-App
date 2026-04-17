import Image from "next/image";
import type { CountryConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

type SupportedCountryCode = CountryConfig["code"];

const flagSrcMap: Record<SupportedCountryCode, string> = {
  AU: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/flags/4x3/au.svg",
  CA: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/flags/4x3/ca.svg",
  US: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/flags/4x3/us.svg"
};

export function CountryFlag({
  countryCode,
  className = "h-8 w-11"
}: {
  countryCode: SupportedCountryCode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex overflow-hidden rounded-[10px] border border-black/10 shadow-sm",
        className
      )}
      role="img"
      aria-label={countryCode}
    >
      <Image
        alt={`${countryCode} flag`}
        src={flagSrcMap[countryCode]}
        fill
        unoptimized
        className="object-cover"
      />
    </span>
  );
}
