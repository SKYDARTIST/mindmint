import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import "../typography.css";

export const metadata: Metadata = {
  title: "MindMint AI",
  description: "Transform your notes into visual mindmaps, flashcards, and quizzes using Gemini 2.5.",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111113" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Tailwind CDN included for compatibility with previous setup. 
            In a full production build, install tailwindcss via npm. */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      gray: {
                        850: '#1f1f23',
                        900: '#111113', 
                        950: '#0F0F11', 
                      }
                    }
                  }
                }
              }
            `,
          }}
        />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}