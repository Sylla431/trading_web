'use client'

import { useTheme, colorThemes, type ColorTheme } from '@/contexts/ThemeContext'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const themeLabels: Record<ColorTheme, string> = {
  emerald: 'Émeraude',
  blue: 'Bleu',
  violet: 'Violet',
  orange: 'Orange',
  rose: 'Rose',
  cyan: 'Cyan',
  amber: 'Ambre',
}

export function ThemeSwitcher() {
  const { colorTheme, setColorTheme } = useTheme()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">Couleur du thème</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choisissez la couleur principale de votre interface
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(colorThemes).map(([key, colors]) => {
          const themeKey = key as ColorTheme
          const isActive = colorTheme === themeKey

          return (
            <button
              key={key}
              onClick={() => setColorTheme(themeKey)}
              className={cn(
                'relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105',
                isActive
                  ? 'border-primary shadow-lg shadow-primary/30'
                  : 'border-border/50 hover:border-border'
              )}
            >
              {/* Indicateur de couleur */}
              <div
                className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-card"
                style={{
                  backgroundColor: colors.primary,
                  boxShadow: `0 4px 12px ${colors.primary}40`,
                }}
              />

              {/* Nom du thème */}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{themeLabels[themeKey]}</p>
              </div>

              {/* Check icon si actif */}
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Aperçu des couleurs */}
      <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Aperçu</p>
        <div className="flex gap-2">
          <div
            className="flex-1 h-12 rounded-lg"
            style={{
              backgroundColor: colorThemes[colorTheme].primary,
            }}
          />
        </div>
        <div className="flex gap-2">
          <div
            className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: colorThemes[colorTheme].primary }}
          >
            Primaire
          </div>
          <div
            className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: colorThemes[colorTheme].primaryLight }}
          >
            Clair
          </div>
          <div
            className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: colorThemes[colorTheme].primaryDark }}
          >
            Foncé
          </div>
        </div>
      </div>
    </div>
  )
}

