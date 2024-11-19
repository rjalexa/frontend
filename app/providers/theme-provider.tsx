// app/providers/theme-provider.tsx
'use client'

import * as React from "react"
import { useEffect, useState } from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark'
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState(defaultTheme)

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(isDark ? 'dark' : 'light')

    // Listen for changes in system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div data-theme={theme} className={theme}>
      {children}
    </div>
  )
}