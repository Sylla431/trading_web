'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Calendar,
  BookOpen,
  Target,
  Settings,
  Wallet,
  LogOut,
  Menu,
  X,
  Palette,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme, colorThemes, type ColorTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { DarkLightToggle } from '@/components/shared/DarkLightToggle'

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/accounts', icon: Wallet, label: 'Comptes' },
  { href: '/dashboard/strategies', icon: Target, label: 'Stratégies' },
  { href: '/dashboard/trades', icon: TrendingUp, label: 'Mes trades' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analyses' },
  { href: '/dashboard/journal', icon: BookOpen, label: 'Journal' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendrier' },
  { href: '/dashboard/import', icon: Upload, label: 'Importer' },
  { href: '/dashboard/settings', icon: Settings, label: 'Paramètres' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut, profile } = useAuth()
  const { colorTheme, setColorTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar flottant avec glassmorphism */}
      <aside
        className={cn(
          'fixed left-4 top-4 bottom-4 z-40 w-64 rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/20 transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col p-4">
          {/* Logo */}
          <div className="flex h-16 items-center px-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h1 className="text-xl font-bold text-primary">
                TradingJournal
              </h1>
            </div>
          </div>

          {/* User info */}
          <div className="mb-4 p-3 rounded-2xl bg-secondary/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
                <span className="text-lg font-bold text-white">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">
                  {profile?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Thème et couleur */}
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
            {/* Toggle Sombre/Clair */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-medium text-muted-foreground">Mode</span>
              <DarkLightToggle />
            </div>

            {/* Color picker rapide */}
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/80 hover:text-foreground rounded-xl transition-all"
            >
              <span className="flex items-center gap-3">
                <Palette className="h-5 w-5" />
                Couleur
              </span>
              <div
                className="w-6 h-6 rounded-full ring-2 ring-border/50"
                style={{
                  backgroundColor: colorThemes[colorTheme].primary,
                }}
              />
            </button>

            {showColorPicker && (
              <div className="mt-2 p-2 rounded-xl bg-secondary/50 backdrop-blur-sm">
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(colorThemes).map(([key, colors]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setColorTheme(key as ColorTheme)
                        setShowColorPicker(false)
                      }}
                      className={cn(
                        'w-10 h-10 rounded-lg ring-2 transition-all hover:scale-110',
                        colorTheme === key
                          ? 'ring-primary ring-offset-2 ring-offset-card scale-110'
                          : 'ring-border/30'
                      )}
                      style={{
                        backgroundColor: colors.primary,
                      }}
                      title={key}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout button */}
          <div className="mt-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive transition-all rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

