// app/client-layout.tsx
'use client';

import { ThemeProvider } from './providers/theme-provider';
import { NavigationProvider } from './providers/navigation-provider';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/header/Header';
import React from 'react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // Ensure navigation logic happens inside useEffect
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  // Show a loading state until Clerk is loaded
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Render the layout if the user is authenticated
  if (!userId) {
    return null; // Prevent rendering if redirect hasn't occurred yet
  }

  return (
    <ThemeProvider defaultTheme="light">
      <NavigationProvider>
        <Header />
        <main>
          <React.Suspense
            fallback={
              <div className="min-h-[calc(100vh-176px)] flex flex-col items-center justify-center">
                <div className="animate-pulse text-blue-700 text-lg">
                  Loading MeMa...
                </div>
              </div>
            }
          >
            {children}
          </React.Suspense>
        </main>
      </NavigationProvider>
    </ThemeProvider>
  );
}
