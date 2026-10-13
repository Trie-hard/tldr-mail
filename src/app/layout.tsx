import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TL;DR Mail — Decode Your Official Mail",
  description:
    "Snap a photo of any confusing official letter and get a plain-language breakdown with deadlines, next steps, and free local help.",
  keywords: [
    "official mail",
    "letter decoder",
    "eviction notice help",
    "utility bill help",
    "plain language",
    "multilingual",
    "legal aid",
    "Austin Texas",
  ],
  authors: [{ name: "TL;DR Mail Team" }],
  openGraph: {
    title: "TL;DR Mail — Decode Your Official Mail",
    description:
      "Snap a photo of any confusing official letter and get a plain-language breakdown with deadlines, next steps, and free local help.",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1a4d3e" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
