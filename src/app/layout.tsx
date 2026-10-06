import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${newsreader.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1a4d3e" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
