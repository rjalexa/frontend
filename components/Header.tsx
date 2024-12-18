// components/Header.tsx
"use client";
import { Menu } from "lucide-react";
import { useEffect } from "react";

if (!process.env.NEXT_PUBLIC_MEMASTATS_URL) {
  console.warn('NEXT_PUBLIC_MEMASTATS_URL environment variable is not set');
}

export default function Header() {
  useEffect(() => {
    console.log("Header component mounted");
  }, []);

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Menu button clicked");
    e.preventDefault();
    try {
      const memaStatsUrl = process.env.NEXT_PUBLIC_MEMASTATS_URL || 'http://localhost:8118';
      window.open(memaStatsUrl, '_blank', 'noopener,noreferrer');
      console.log("Window.open called with URL:", memaStatsUrl);
    } catch (error) {
      console.error("Error opening window:", error);
    }
  };

  return (
    <div className="w-full">
      {/* Header container */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          {/* Menu button on the left */}
          <button 
            type="button"
            onClick={handleMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          {/* Logo in the center */}
          <div className="flex flex-col items-center">
            <img src="/manifesto_logo.svg" alt="il manifesto" className="h-8" />
          </div>

          {/* User icon on the right */}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Bottom border */}
      <div className="w-full border-b border-gray-200" />
      
      {/* Red bar */}
      <div className="w-full h-2 bg-red-600" />
    </div>
  );
}