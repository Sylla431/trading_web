'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { X, Smile, Frown, Meh, Battery, Brain, Target } from 'lucide-react'
import { useJournal, type JournalEntry } from '@/lib/hooks/useJournal'

interface AddJournalDialogProps {
  onClose: () => void
  entryToEdit?: JournalEntry
}

const MOODS = [
  { value: 'excellent', label: 'Excellent', icon: '😄', color: 'text-green-600' },
  { value: 'good', label: 'Bien', icon: '🙂', color: 'text-green-500' },
  { value: 'neutral', label: 'Neutre', icon: '😐', color: 'text-gray-500' },
  { value: 'bad', label: 'Mauvais', icon: '😟', color: 'text-orange-500' },
  { value: 'terrible', label: 'Terrible', icon: '😞', color: 'text-red-600' },
]

export function AddJournalDialog({ onClose, entryToEdit }: AddJournalDialogProps) {
  const { addEntry, updateEntry } = useJournal()
  const isEdit = Boolean(entryToEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    mood: 'neutral' as JournalEntry['mood'],
    energy_level: 5,
    stress_level: 5,
    confidence_level: 5,
    what_went_well: '',
    what_to_improve: '',
    lessons_learned: '',
    market_analysis: '',
    followed_plan: true,
    discipline_score: 7,
    notes: '',
  })

  useEffect(() => {
    if (entryToEdit) {
      setFormData({
        entry_date: entryToEdit.entry_date,
        mood: entryToEdit.mood || 'neutral',
        energy_level: entryToEdit.energy_level || 5,
        stress_level: entryToEdit.stress_level || 5,
        confidence_level: entryToEdit.confidence_level || 5,
        what_went_well: entryToEdit.what_went_well || '',
        what_to_improve: entryToEdit.what_to_improve || '',
        lessons_learned: entryToEdit.lessons_learned || '',
        market_analysis: entryToEdit.market_analysis || '',
        followed_plan: entryToEdit.followed_plan ?? true,
        discipline_score: entryToEdit.discipline_score || 7,
        notes: entryToEdit.notes || '',
      })
    }
  }, [entryToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let error: Error | null = null
      
      if (isEdit && entryToEdit) {
        const { error: updateErr } = await updateEntry(entryToEdit.id, formData)
        error = updateErr ?? null
      } else {
        const { error: addErr } = await addEntry(formData)
        error = addErr ?? null
      }

      if (error) {
        toast.error('Erreur lors de l\'enregistrement', {
          description: error.message,
        })
      } else {
        toast.success(isEdit ? 'Entrée mise à jour !' : 'Entrée ajoutée avec succès !')
        onClose()
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-hidden">
      <Card className="w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 border-b">
          <div>
            <CardTitle>{isEdit ? 'Éditer l\'entrée' : 'Nouvelle entrée de journal'}</CardTitle>
            <CardDescription>
              Notez vos réflexions et analysez votre journée de trading
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="entry_date">Date *</Label>
              <Input
                id="entry_date"
                type="date"
                value={formData.entry_date}
                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                required
              />
            </div>

            {/* Humeur */}
            <div className="space-y-3">
              <Label>Humeur générale</Label>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood: mood.value as JournalEntry['mood'] })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.mood === mood.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood.icon}</div>
                    <div className={`text-xs font-medium ${mood.color}`}>{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Niveaux (Énergie, Stress, Confiance) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="energy_level" className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-green-600" />
                  Énergie
                </Label>
                <Input
                  id="energy_level"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energy_level}
                  onChange={(e) => setFormData({ ...formData, energy_level: Number(e.target.value) })}
                  className="w-full"
                />
                <p className="text-center text-sm font-bold text-green-600">{formData.energy_level}/10</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stress_level" className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-orange-600" />
                  Stress
                </Label>
                <Input
                  id="stress_level"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.stress_level}
                  onChange={(e) => setFormData({ ...formData, stress_level: Number(e.target.value) })}
                  className="w-full"
                />
                <p className="text-center text-sm font-bold text-orange-600">{formData.stress_level}/10</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence_level" className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Confiance
                </Label>
                <Input
                  id="confidence_level"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.confidence_level}
                  onChange={(e) => setFormData({ ...formData, confidence_level: Number(e.target.value) })}
                  className="w-full"
                />
                <p className="text-center text-sm font-bold text-blue-600">{formData.confidence_level}/10</p>
              </div>
            </div>

            {/* Réflexions */}
            <div className="space-y-4">
              <h3 className="font-semibold">Réflexions du jour</h3>
              
              <div className="space-y-2">
                <Label htmlFor="what_went_well">Ce qui a bien fonctionné ✅</Label>
                <textarea
                  id="what_went_well"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Qu'avez-vous bien fait aujourd'hui ?"
                  value={formData.what_went_well}
                  onChange={(e) => setFormData({ ...formData, what_went_well: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="what_to_improve">À améliorer 🎯</Label>
                <textarea
                  id="what_to_improve"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Qu'est-ce qui pourrait être amélioré ?"
                  value={formData.what_to_improve}
                  onChange={(e) => setFormData({ ...formData, what_to_improve: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessons_learned">Leçons apprises 💡</Label>
                <textarea
                  id="lessons_learned"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Quelles leçons tirez-vous de cette journée ?"
                  value={formData.lessons_learned}
                  onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="market_analysis">Analyse du marché 📊</Label>
                <textarea
                  id="market_analysis"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Comment s'est comporté le marché aujourd'hui ?"
                  value={formData.market_analysis}
                  onChange={(e) => setFormData({ ...formData, market_analysis: e.target.value })}
                />
              </div>
            </div>

            {/* Discipline */}
            <div className="space-y-4">
              <h3 className="font-semibold">Discipline et plan</h3>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="followed_plan"
                  checked={formData.followed_plan}
                  onChange={(e) => setFormData({ ...formData, followed_plan: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="followed_plan" className="cursor-pointer">
                  J&apos;ai respecté mon plan de trading aujourd&apos;hui
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discipline_score">Score de discipline (1-10)</Label>
                <Input
                  id="discipline_score"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.discipline_score}
                  onChange={(e) => setFormData({ ...formData, discipline_score: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Très faible</p>
                  <p className="text-lg font-bold text-primary">{formData.discipline_score}/10</p>
                  <p className="text-sm text-muted-foreground">Excellent</p>
                </div>
              </div>
            </div>

            {/* Notes générales */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes générales</Label>
              <textarea
                id="notes"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Autres observations, pensées, objectifs..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

