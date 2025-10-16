'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type ColorTheme = 'emerald' | 'blue' | 'violet' | 'orange' | 'rose' | 'cyan' | 'amber'

interface ThemeContextType {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const colorThemes = {
  emerald: {
    primary: '#10b981',
    primaryLight: '#34d399',
    primaryDark: '#059669',
  },
  blue: {
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',
  },
  violet: {
    primary: '#8b5cf6',
    primaryLight: '#a78bfa',
    primaryDark: '#7c3aed',
  },
  orange: {
    primary: '#f97316',
    primaryLight: '#fb923c',
    primaryDark: '#ea580c',
  },
  rose: {
    primary: '#f43f5e',
    primaryLight: '#fb7185',
    primaryDark: '#e11d48',
  },
  cyan: {
    primary: '#06b6d4',
    primaryLight: '#22d3ee',
    primaryDark: '#0891b2',
  },
  amber: {
    primary: '#f59e0b',
    primaryLight: '#fbbf24',
    primaryDark: '#d97706',
  },
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('emerald')

  useEffect(() => {
    // Charger le thème depuis localStorage
    const savedTheme = localStorage.getItem('color-theme') as ColorTheme
    if (savedTheme && colorThemes[savedTheme]) {
      setColorThemeState(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Appliquer le thème au document
    const colors = colorThemes[colorTheme]
    document.documentElement.style.setProperty('--color-primary', colors.primary)
    document.documentElement.style.setProperty('--color-primary-light', colors.primaryLight)
    document.documentElement.style.setProperty('--color-primary-dark', colors.primaryDark)
    
    // Sauvegarder dans localStorage
    localStorage.setItem('color-theme', colorTheme)
  }, [colorTheme])

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme)
  }

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider')
  }
  return context
}

export { colorThemes }
export type { ColorTheme }

