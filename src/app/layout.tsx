import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
