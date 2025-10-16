'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher'
import { DarkLightToggle } from '@/components/shared/DarkLightToggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { Palette, User, Bell, Shield, Download, Moon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')

  const handleSaveProfile = () => {
    toast.success('Profil mis à jour avec succès !')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l&apos;apparence de votre interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode sombre/clair */}
            <div>
              <h3 className="text-sm font-medium mb-3">Mode d&apos;affichage</h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div>
                  <p className="font-medium text-sm">Mode sombre / clair</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Basculez entre le thème sombre et clair
                  </p>
                </div>
                <DarkLightToggle />
              </div>
            </div>

            {/* Couleurs */}
            <ThemeSwitcher />
          </CardContent>
        </Card>

        {/* Profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil
            </CardTitle>
            <CardDescription>
              Informations de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                L&apos;email ne peut pas être modifié
              </p>
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              Enregistrer les modifications
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notifications email</p>
                <p className="text-xs text-muted-foreground">
                  Recevoir des résumés hebdomadaires
                </p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-border/50 bg-card/50"
                defaultChecked
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Alertes de trading</p>
                <p className="text-xs text-muted-foreground">
                  Alertes pour objectifs atteints
                </p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-border/50 bg-card/50"
                defaultChecked
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Rappels quotidiens</p>
                <p className="text-xs text-muted-foreground">
                  Rappel de saisie du journal
                </p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-border/50 bg-card/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Paramètres de sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Changer le mot de passe
            </Button>

            <Button variant="outline" className="w-full justify-start">
              Activer l&apos;authentification 2FA
            </Button>

            <Button variant="outline" className="w-full justify-start">
              Sessions actives
            </Button>
          </CardContent>
        </Card>

        {/* Données */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Vos données
            </CardTitle>
            <CardDescription>
              Exportez ou supprimez vos données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter les données (CSV)
              </Button>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter les données (JSON)
              </Button>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button variant="destructive">
                Supprimer mon compte
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Cette action est irréversible. Toutes vos données seront supprimées.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

