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
  title: "MindMint - AI Study Assistant",
  description: "Transform your notes into mindmaps, flashcards, quizzes, and study materials with AI. Study smarter, not harder.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MindMint",
  },
};

import { SubscriptionProvider } from "@/lib/contexts/SubscriptionContext";
import { PWARegister } from "@/components/PWARegister";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <PWARegister />
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </body>
    </html>
  );
}
