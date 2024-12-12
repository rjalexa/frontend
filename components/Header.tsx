import React from 'react';
import { Menu } from 'lucide-react';

const Header = () => {
  return (
    <div className="w-full">
      {/* Red bar */}
      <div className="w-full h-2 bg-red-600" />
      
      {/* Header container */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          {/* Menu button on the left */}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          {/* Logo in the center */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-600">quotidiano comunista</div>
            <div className="font-serif text-4xl">il manifesto</div>
          </div>

          {/* User icon placeholder on the right */}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Bottom border */}
      <div className="w-full border-b border-gray-200" />
    </div>
  );
};

export default Header;import { Menu } from "lucide-react";

export default function Header() {
  return (
    <div className="w-full">
      {/* Red bar */}
      <div className="w-full h-2 bg-red-600" />
      
      {/* Header container */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          {/* Menu button on the left */}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          {/* Logo in the center */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-600">quotidiano comunista</div>
            <div className="font-serif text-4xl">il manifesto</div>
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
    </div>
  );
}
