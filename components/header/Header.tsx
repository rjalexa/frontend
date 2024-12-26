// components/header/Header.tsx
'use client'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useNavigation } from '@/app/providers/navigation-provider'

export default function Header() {
  const { isMenuOpen, setMenuOpen } = useNavigation()
  const router = useRouter()
  
  const handleArticlesClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const lastArticle = localStorage.getItem('lastViewedArticle')
    setMenuOpen(false)
    if (lastArticle && window.location.pathname === '/statistics') {
      router.push(`/article/${lastArticle}`)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="p-2"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>

          <div className="flex flex-col items-center">
            <Image
              src="/manifesto_logo.svg"
              alt="il manifesto"
              width={256}
              height={256}
              priority
            />
          </div>

          <button
            type="button"
            disabled
            className="p-2 cursor-not-allowed opacity-50"
            aria-label="User menu (disabled)"
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

        {/* Navigation Menu */}
        {isMenuOpen && (
          <nav className="absolute left-0 w-64 bg-white shadow-lg z-50 mt-2">
            <div className="py-2">
              <a
                href="#"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={handleArticlesClick}
              >
                Articoli
              </a>
              <Link
                href="/statistics"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Statistiche
              </Link>
            </div>
          </nav>
        )}
      </div>

      <div>
        <div className="border-b border-gray-200" />
        <div className="h-2 bg-red-600" />
      </div>
    </div>
  )
}