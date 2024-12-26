// app/providers/navigation-provider.tsx
'use client'
import { createContext, useContext, useState } from 'react'

type NavigationContext = {
  isMenuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

const NavigationContext = createContext<NavigationContext>({
  isMenuOpen: false,
  setMenuOpen: () => {}
})

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  return (
    <NavigationContext.Provider value={{ isMenuOpen, setMenuOpen }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => useContext(NavigationContext)