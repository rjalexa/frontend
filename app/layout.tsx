// app/layout.tsx
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import { ThemeProvider } from "./providers/theme-provider";
import { Suspense } from 'react';
import "./globals.css";
import { Playfair_Display } from 'next/font/google';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MeMa V7",
  description: "Il Manifesto - Isagog SrL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable}`}>
      <body className="antialiased">
        <ThemeProvider defaultTheme="light">
          <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center">
              <div className="animate-pulse text-blue-700 text-lg">
                Loading MeMa...
              </div>
            </div>
          }>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
