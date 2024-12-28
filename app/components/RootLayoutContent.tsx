'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "../providers/theme-provider";
import { NavigationProvider } from "../providers/navigation-provider";
import { Suspense } from "react";
import Header from "@/components/header/Header";

export default function RootLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ThemeProvider defaultTheme="light">
        <NavigationProvider>
          <Header />
          <main>
            <Suspense fallback={
              <div className="min-h-[calc(100vh-176px)] flex flex-col items-center justify-center">
                <div className="animate-pulse text-blue-700 text-lg">Loading MeMa...</div>
              </div>
            }>
              {children}
            </Suspense>
          </main>
        </NavigationProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
