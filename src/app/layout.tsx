import type { Metadata } from "next";
import { Geist_Mono, Newsreader, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rajshree — Coal Trading",
  description: "Internal coal trading dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full min-h-full">{children}</body>
    </html>
  );
}
