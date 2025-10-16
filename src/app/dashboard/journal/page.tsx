'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddJournalDialog } from '@/components/journal/AddJournalDialog'
import { useJournal, type JournalEntry } from '@/lib/hooks/useJournal'
import { Plus, BookOpen, Calendar, Edit2, Trash2, CheckCircle2, XCircle, Battery, Brain, Target } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const MOOD_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  excellent: { icon: '😄', color: 'text-green-600', label: 'Excellent' },
  good: { icon: '🙂', color: 'text-green-500', label: 'Bien' },
  neutral: { icon: '😐', color: 'text-gray-500', label: 'Neutre' },
  bad: { icon: '😟', color: 'text-orange-500', label: 'Mauvais' },
  terrible: { icon: '😞', color: 'text-red-600', label: 'Terrible' },
}

export default function JournalPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const { entries, loading, deleteEntry, fetchEntries } = useJournal()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | undefined>()
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return

    try {
      const { error } = await deleteEntry(id)
      if (error) throw error
      toast.success('Entrée supprimée')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleEdit = (entry: JournalEntry) => {
    setEntryToEdit(entry)
    setSelectedEntry(null)
    setShowAddDialog(true)
  }

  const handleCloseDialog = () => {
    setShowAddDialog(false)
    setEntryToEdit(undefined)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Journal de trading</h1>
          <p className="text-muted-foreground">
            Suivez votre évolution mentale et vos réflexions quotidiennes
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle entrée
        </Button>
      </div>

      {/* Liste des entrées */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucune entrée</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez votre journal de trading pour suivre votre évolution
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Première entrée
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const moodInfo = MOOD_ICONS[entry.mood || 'neutral']
            return (
              <Card
                key={entry.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedEntry(entry)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{moodInfo.icon}</div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {format(new Date(entry.entry_date), 'EEEE dd MMMM yyyy', { locale: fr })}
                        </CardTitle>
                        <CardDescription className={moodInfo.color}>
                          {moodInfo.label}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(entry)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(entry.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Niveaux */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Battery className="w-3 h-3 text-green-600" />
                        <p className="text-xs text-muted-foreground">Énergie</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">{entry.energy_level || '-'}/10</p>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-3 h-3 text-orange-600" />
                        <p className="text-xs text-muted-foreground">Stress</p>
                      </div>
                      <p className="text-lg font-bold text-orange-600">{entry.stress_level || '-'}/10</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-3 h-3 text-blue-600" />
                        <p className="text-xs text-muted-foreground">Confiance</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{entry.confidence_level || '-'}/10</p>
                    </div>
                  </div>

                  {/* Discipline */}
                  {(entry.followed_plan !== undefined || entry.discipline_score) && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2">
                        {entry.followed_plan ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="text-sm font-medium">
                          {entry.followed_plan ? 'Plan respecté' : 'Plan non respecté'}
                        </span>
                      </div>
                      {entry.discipline_score && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Discipline: </span>
                          <span className="font-bold text-primary">{entry.discipline_score}/10</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aperçu des notes */}
                  {(entry.what_went_well || entry.lessons_learned || entry.notes) && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {entry.what_went_well || entry.lessons_learned || entry.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de détails */}
      {selectedEntry && (
        <JournalDetailsModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={handleEdit}
        />
      )}

      {/* Dialog d'ajout/édition */}
      {showAddDialog && (
        <AddJournalDialog
          onClose={handleCloseDialog}
          entryToEdit={entryToEdit}
        />
      )}
    </div>
  )
}

function JournalDetailsModal({
  entry,
  onClose,
  onEdit,
}: {
  entry: JournalEntry
  onClose: () => void
  onEdit: (entry: JournalEntry) => void
}) {
  const moodInfo = MOOD_ICONS[entry.mood || 'neutral']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 border-b">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{moodInfo.icon}</div>
            <div>
              <CardTitle className="text-2xl">
                {format(new Date(entry.entry_date), 'EEEE dd MMMM yyyy', { locale: fr })}
              </CardTitle>
              <CardDescription className={moodInfo.color}>
                {moodInfo.label}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(entry)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-6 py-6">
          {/* Niveaux */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Battery className="w-4 h-4 text-green-600" />
                <p className="text-sm text-muted-foreground">Énergie</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{entry.energy_level || '-'}/10</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-orange-600" />
                <p className="text-sm text-muted-foreground">Stress</p>
              </div>
              <p className="text-3xl font-bold text-orange-600">{entry.stress_level || '-'}/10</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-muted-foreground">Confiance</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{entry.confidence_level || '-'}/10</p>
            </div>
          </div>

          {/* Discipline */}
          {(entry.followed_plan !== undefined || entry.discipline_score) && (
            <div className="p-4 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {entry.followed_plan ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {entry.followed_plan ? 'Plan respecté' : 'Plan non respecté'}
                  </span>
                </div>
                {entry.discipline_score && (
                  <div className="text-lg">
                    <span className="text-muted-foreground">Discipline: </span>
                    <span className="font-bold text-primary">{entry.discipline_score}/10</span>
                  </div>
                )}
              </div>
              {entry.discipline_score && (
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${entry.discipline_score * 10}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Réflexions */}
          {entry.what_went_well && (
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <p className="text-sm font-semibold text-green-600 mb-2">✅ Ce qui a bien fonctionné</p>
              <p className="text-sm whitespace-pre-wrap">{entry.what_went_well}</p>
            </div>
          )}

          {entry.what_to_improve && (
            <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <p className="text-sm font-semibold text-orange-600 mb-2">🎯 À améliorer</p>
              <p className="text-sm whitespace-pre-wrap">{entry.what_to_improve}</p>
            </div>
          )}

          {entry.lessons_learned && (
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-sm font-semibold text-blue-600 mb-2">💡 Leçons apprises</p>
              <p className="text-sm whitespace-pre-wrap">{entry.lessons_learned}</p>
            </div>
          )}

          {entry.market_analysis && (
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <p className="text-sm font-semibold text-purple-600 mb-2">📊 Analyse du marché</p>
              <p className="text-sm whitespace-pre-wrap">{entry.market_analysis}</p>
            </div>
          )}

          {entry.notes && (
            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-sm font-semibold mb-2">📝 Notes générales</p>
              <p className="text-sm whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={() => onEdit(entry)} className="flex-1">
              <Edit2 className="w-4 h-4 mr-2" />
              Éditer
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
