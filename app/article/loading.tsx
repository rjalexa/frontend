// app/article/loading.tsx
"use client";

import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Microscope,
  Highlighter,
  FileText,
  Hash,
  Globe,
} from "lucide-react";
import Image from "next/image";
import React from "react";

export default function ArticleLoading() {
  return (
    <div className="bg-white min-h-screen">
      <main className="px-8">
        <div className="mx-auto">
          {/* Navigation buttons skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-300">
              <ArrowLeft className="w-4 h-4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2 text-gray-300">
              <ArrowUp className="w-4 h-4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <ArrowDown className="w-4 h-4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            </div>
          </div>

          {/* MeMa logo and controls skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Image
              src="/mema.svg"
              alt="MeMa Logo"
              width={64}
              height={24}
              className="w-16 h-6"
            />
            <div className="flex items-center gap-4">
              {[
                { icon: <Hash className="w-4 h-4" />, width: "w-24" },
                { icon: <FileText className="w-4 h-4" />, width: "w-24" },
                { icon: <Highlighter className="w-4 h-4" />, width: "w-28" },
                { icon: <Globe className="w-4 h-4" />, width: "w-24" },
                { icon: <Microscope className="w-4 h-4" />, width: "w-32" },
              ].map((button, index) => (
                <div
                  key={index}
                  className={`px-6 py-2 rounded-full bg-gray-100 text-gray-400 flex items-center gap-2 ${button.width}`}
                >
                  {button.icon}
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Article content skeleton */}
          <div className="relative mt-6">
            {/* Title skeleton */}
            <div className="space-y-3 mb-6">
              <div className="h-10 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-10 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>

            {/* Author and date line skeleton */}
            <div className="flex justify-between items-center mb-8">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
            </div>

            {/* Article body skeleton */}
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-11/12" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

