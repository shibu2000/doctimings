import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DocTimings — Doctor Visiting Schedules, Chamber Timings & Availability",
  description:
    "Find verified doctors, clinic chamber schedules, and real-time availability today across Bengal towns and pan-India medical hubs.",
  keywords: [
    "DocTimings",
    "doctor timings",
    "doctor visiting schedule",
    "Bengal doctor chambers",
    "clinic chamber timings",
    "doctor availability today",
    "doctor near me",
  ],
  authors: [{ name: "DocTimings" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "DocTimings — Doctor Visiting Schedules & Chamber Timings",
    description: "Real-time doctor presence, weekly chamber visits, and verified timings.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F766E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoSans.className}>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
