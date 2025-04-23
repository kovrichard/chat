import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/analytics";
import { Providers } from "@/components/providers";
import conf from "@/lib/config";
import { canonicalUrl, metaDescription, metaTitle, openGraph } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Viewport } from "next";
import React from "react";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(conf.host),
  alternates: {
    canonical: canonicalUrl,
  },
  title: metaTitle,
  description: metaDescription,
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  // creator: "",
  robots: "index, follow",
  openGraph: {
    ...openGraph,
    url: conf.host,
  },
  twitter: {
    // creator: "@",
    card: "summary_large_image",
    title: metaTitle,
    description: metaDescription,
  },
  category: "",
  keywords: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Analytics />
      </head>
      <body
        className={cn(
          montserrat.className,
          "flex flex-col min-h-svh min-w-80 justify-center md:overscroll-none"
        )}
      >
        <Providers>
          {children}
          <SpeedInsights />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
