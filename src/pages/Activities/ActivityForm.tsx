import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export function ActivityForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    titre: '', description: '', lieu: '', date: '', heure_debut: '', heure_fin: '',
  })

  useEffect(() => {
    if (id) {
      supabase.from('activites').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setForm({ titre: data.titre, description: data.description, lieu: data.lieu, date: data.date, heure_debut: data.heure_debut, heure_fin: data.heure_fin })
      })
    }
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, participants: [] }

    if (isEditing) {
      const { error } = await supabase.from('activites').update(payload).eq('id', id)
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Activité modifiée')
    } else {
      const { error } = await supabase.from('activites').insert(payload)
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Activité ajoutée')
    }
    navigate('/activites')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <button onClick={() => navigate('/activites')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="text-2xl font-bold">{isEditing ? 'Modifier' : 'Ajouter'} une activité</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Titre" name="titre" value={form.titre} onChange={handleChange} required />
          <Textarea label="Description" name="description" value={form.description} onChange={handleChange} rows={3} />
          <Input label="Lieu" name="lieu" value={form.lieu} onChange={handleChange} />
          <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Heure début" name="heure_debut" type="time" value={form.heure_debut} onChange={handleChange} />
            <Input label="Heure fin" name="heure_fin" type="time" value={form.heure_fin} onChange={handleChange} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" type="button" onClick={() => navigate('/activites')}>Annuler</Button>
            <Button type="submit" loading={loading}>{isEditing ? 'Modifier' : 'Ajouter'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
