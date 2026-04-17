import type { CountryConfig } from "@/lib/types";

type SupportedCountryCode = CountryConfig["code"];

const flagMap: Record<SupportedCountryCode, React.ReactNode> = {
  CA: (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="h-full w-full">
      <rect width="64" height="64" rx="32" fill="#FFFFFF" />
      <rect x="4" y="4" width="14" height="56" rx="7" fill="#D52B1E" />
      <rect x="46" y="4" width="14" height="56" rx="7" fill="#D52B1E" />
      <path
        d="M32 15.5 35.2 23h7.4l-5.9 4.6 2.1 7.6-6.8-4.2-6.8 4.2 2.1-7.6-5.9-4.6h7.4L32 15.5Z"
        fill="#D52B1E"
      />
      <path d="M32 28.5c3.8 0 6.8 2.8 6.8 6.3 0 4.2-3 8.2-6.8 10.7-3.8-2.5-6.8-6.5-6.8-10.7 0-3.5 3-6.3 6.8-6.3Z" fill="#D52B1E" />
    </svg>
  ),
  US: (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="h-full w-full">
      <rect width="64" height="64" rx="32" fill="#FFFFFF" />
      <path
        d="M12 14h40a18 18 0 0 1 0 36H12a18 18 0 0 1 0-36Z"
        fill="#FFFFFF"
      />
      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
        <rect key={index} x="12" y={14 + index * 5.2} width="40" height="2.6" fill="#B22234" />
      ))}
      <path d="M12 14h20v19H12z" fill="#3C3B6E" />
      {[
        [16, 18],
        [22, 18],
        [28, 18],
        [19, 22],
        [25, 22],
        [16, 26],
        [22, 26],
        [28, 26]
      ].map(([cx, cy], index) => (
        <circle key={index} cx={cx} cy={cy} r="1.2" fill="#FFFFFF" />
      ))}
    </svg>
  ),
  AU: (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="h-full w-full">
      <rect width="64" height="64" rx="32" fill="#012169" />
      <path d="M10 14h22v18H10z" fill="#012169" />
      <path d="M10 16.5 28.5 30M28.5 16.5 10 30" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M10 18 27 30M27 18 10 30" stroke="#C8102E" strokeWidth="2" />
      <path d="M19 14v18M10 23h22" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M19 14v18M10 23h22" stroke="#C8102E" strokeWidth="3" />
      {[
        [42, 20, 3.8],
        [50, 28, 2.8],
        [39, 35, 2.6],
        [49, 41, 3.2],
        [32, 44, 2.4]
      ].map(([cx, cy, r], index) => (
        <circle key={index} cx={cx} cy={cy} r={r} fill="#FFFFFF" />
      ))}
    </svg>
  )
};

export function CountryFlag({ countryCode, className = "size-10" }: { countryCode: SupportedCountryCode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm ${className}`}
      role="img"
      aria-label={countryCode}
    >
      {flagMap[countryCode]}
    </span>
  );
}
