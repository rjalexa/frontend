// app/layout.tsx
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "./providers/theme-provider";
import { Suspense } from "react";
import "./globals.css";

// Load the Inter font
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MeMa V7",
  description: "Il Manifesto - Isagog SrL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontSans.variable}>
      {/* 
        In the App Router, you can directly place <head> inside your layout.
        This <link> ensures your mema.svg is preloaded as an image.
      */}
      <head>
        <link
          rel="preload"
          href="/mema.svg"
          as="image"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider defaultTheme="light">
          <Suspense
            fallback={
              <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-pulse text-blue-700 text-lg">
                  Loading MeMa...
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
