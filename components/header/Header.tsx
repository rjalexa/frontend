// components/header/Header.tsx
"use client";
import { Menu } from "lucide-react";
import Image from "next/image";

export default function Header() {

  return (
    <div className="w-full">
      {/* Header container */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Menu button on the left */}
          <button
            type="button"
            disabled
            className="p-2 cursor-not-allowed opacity-50"
            aria-label="Menu (disabled)"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          {/* Logo in the center */}
          <div className="flex flex-col items-center">
            <Image
              src="/manifesto_logo.svg"
              alt="il manifesto"
              width={256}
              height={256}
              priority
            />
          </div>

          {/* User icon on the right */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="User menu"
          >
            <svg
              className="h-6 w-6 text-gray-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom border and red bar combined */}
      <div>
        <div className="border-b border-gray-200" />
        <div className="h-2 bg-red-600" />
      </div>
    </div>
  );
}
