'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedIcon, TradingIcons } from '@/components/shared/AnimatedIcon'
import { Plus, Calendar as CalendarIcon, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  event_type: string
  event_date: string
  impact?: 'low' | 'medium' | 'high'
  affected_currencies?: string[]
}

const impactColors = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  medium: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user?.id)
        .order('event_date', { ascending: true })

      if (error) throw error
      setEvents(data as CalendarEvent[])
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <AnimatedIcon icon={TradingIcons.calendar} size={36} />
            Calendrier de trading
          </h1>
          <p className="text-muted-foreground">
            Événements économiques et sessions de trading
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un événement
        </Button>
      </div>

      {/* Liste des événements */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <AnimatedIcon icon={TradingIcons.calendar} size={64} />
            <p className="text-muted-foreground mt-4 mb-2 font-medium">
              Aucun événement pour le moment
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Ajoutez des événements économiques et des rappels de trading
            </p>
            <Button>
              <Plus className="mr-2 w-4 h-4" />
              Ajouter un événement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card
              key={event.id}
              className="hover:scale-[1.01] transition-all border-2 border-border/50 hover:border-primary/30"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      {event.impact && (
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                            impactColors[event.impact]
                          }`}
                        >
                          Impact {event.impact}
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      {format(new Date(event.event_date), 'EEEE d MMMM yyyy à HH:mm', {
                        locale: fr,
                      })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {(event.description || event.affected_currencies) && (
                <CardContent className="space-y-2">
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  {event.affected_currencies && event.affected_currencies.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {event.affected_currencies.map((currency) => (
                        <span
                          key={currency}
                          className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium"
                        >
                          {currency}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

