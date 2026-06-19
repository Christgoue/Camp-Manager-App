import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { useOffline } from '@/contexts/OfflineContext'
import toast from 'react-hot-toast'

interface Props {
  onDone: () => void
  campeurs: Record<string, string>
}

export function IncidentForm({ onDone, campeurs }: Props) {
  const { profile } = useAuth()
  const { isOnline, addToSyncQueue } = useOffline()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<{
    type: string; campeur_id: string; description: string; gravite: 'faible' | 'moyen' | 'eleve'
  }>({
    type: '', campeur_id: '', description: '', gravite: 'moyen',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.campeur_id) { toast.error('Sélectionnez un campeur'); return }
    setLoading(true)

    const payload = {
      type: form.type,
      campeur_id: form.campeur_id,
      description: form.description,
      gravite: form.gravite,
      statut: 'ouvert',
      created_by: profile?.id || '',
    }

    if (isOnline) {
      const { error } = await supabase.from('incidents').insert(payload)
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Incident signalé')
    } else {
      await addToSyncQueue('incidents', 'insert', payload)
      toast.success('Incident enregistré (hors ligne)')
    }
    setLoading(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Type d'incident" placeholder="Ex: Blessure, Disparition..." value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} required />
      <Select
        label="Campeur concerné"
        value={form.campeur_id}
        onChange={e => setForm(p => ({ ...p, campeur_id: e.target.value }))}
        options={[
          { value: '', label: 'Sélectionner...' },
          ...Object.entries(campeurs).map(([id, name]) => ({ value: id, label: name })),
        ]}
      />
      <Select
        label="Gravité"
        value={form.gravite}
        onChange={e => setForm(p => ({ ...p, gravite: e.target.value as 'faible' | 'moyen' | 'eleve' }))}
        options={[
          { value: 'faible', label: 'Faible' },
          { value: 'moyen', label: 'Moyen' },
          { value: 'eleve', label: 'Élevé' },
        ]}
      />
      <Textarea label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} required />
      <Button type="submit" loading={loading} className="w-full">Signaler</Button>
    </form>
  )
}
