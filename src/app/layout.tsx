import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
