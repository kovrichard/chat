import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/analytics";
import conf from "@/lib/config";
import { canonicalUrl, metaDescription, metaTitle, openGraph } from "@/lib/metadata";
import { QueryProvider } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import React from "react";
import { Toaster } from "sonner";

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
          "flex flex-col min-h-svh min-w-80 justify-center overscroll-none"
        )}
      >
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
