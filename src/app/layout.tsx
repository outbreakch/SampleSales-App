import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";

const adelle = localFont({
  variable: "--font-adelle",
  display: "swap",
  src: [
    {
      path: "../../public/assets/fonts/AdelleBSOffice-Light.ttf",
      weight: "300",
      style: "normal"
    },
    {
      path: "../../public/assets/fonts/AdelleBSOffice-LightItalic.ttf",
      weight: "300",
      style: "italic"
    },
    {
      path: "../../public/assets/fonts/AdelleBSOffice.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "../../public/assets/fonts/AdelleBSOffice-Italic.ttf",
      weight: "400",
      style: "italic"
    },
    {
      path: "../../public/assets/fonts/AdelleBSOffice-Semibold.ttf",
      weight: "600",
      style: "normal"
    },
    {
      path: "../../public/assets/fonts/AdelleBSOffice-SemiboldItalic.ttf",
      weight: "600",
      style: "italic"
    },
    {
      path: "../../public/assets/fonts/AdelleBSOffice-Bold.ttf",
      weight: "700",
      style: "normal"
    },
    {
      path: "../../public/assets/fonts/AdelleBSOffice-BoldItalic.ttf",
      weight: "700",
      style: "italic"
    }
  ]
});

const adelleSans = localFont({
  variable: "--font-adelle-sans",
  display: "swap",
  src: [
    {
      path: "../../public/assets/fonts/AdelleSansBSOffice-Light.ttf",
      weight: "300",
      style: "normal"
    },
    {
      path: "../../public/assets/fonts/AdelleSansBSOffice-Regular.ttf",
      weight: "400",
      style: "normal"
    }
  ]
});

export const metadata: Metadata = {
  title: "Sample Sale POS",
  description: "Responsive sample sale POS for staff and admin teams."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${adelle.variable} ${adelleSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem("sample-sale-theme");
                  var theme = stored === "dark" ? "dark" : "light";
                  var root = document.documentElement;
                  root.dataset.theme = theme;
                  if (theme === "dark") root.classList.add("theme-dark");
                } catch (error) {}
              })();
            `
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
