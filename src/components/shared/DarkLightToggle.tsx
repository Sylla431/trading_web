'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export function DarkLightToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative w-14 h-8 rounded-full transition-all duration-300',
        'bg-secondary/50 hover:bg-secondary/80',
        'border-2 border-border/50'
      )}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {/* Toggle */}
      <div
        className={cn(
          'absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300',
          'flex items-center justify-center',
          'bg-primary shadow-lg',
          isDark ? 'translate-x-6' : 'translate-x-0'
        )}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-white" />
        ) : (
          <Sun className="w-3 h-3 text-white" />
        )}
      </div>
    </button>
  )
}

