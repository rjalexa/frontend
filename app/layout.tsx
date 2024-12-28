import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import RootLayoutContent from "./components/RootLayoutContent";
import "./globals.css";

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
      <head>
        <link
          rel="preload"
          href="/mema.svg"
          as="image"
        />
      </head>
      <body className="antialiased">
        <RootLayoutContent>
          {children}
        </RootLayoutContent>
      </body>
    </html>
  );
}
