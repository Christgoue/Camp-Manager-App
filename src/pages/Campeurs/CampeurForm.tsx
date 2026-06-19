import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Campeur } from '@/lib/types'

const unites = ['Louveteaux', 'Éclaireurs', 'Pionniers', 'Routiers', 'Farandole']

export function CampeurForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nom: '', prenom: '', date_naissance: '', unite: unites[0],
    allergies: '', restrictions_alimentaires: '', contact_urgence_nom: '',
    contact_urgence_telephone: '', fiche_sante: '', notes: '',
  })

  useEffect(() => {
    if (id) {
      supabase.from('campeurs').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          const c = data as Campeur
          setForm({ nom: c.nom, prenom: c.prenom, date_naissance: c.date_naissance, unite: c.unite, allergies: c.allergies, restrictions_alimentaires: c.restrictions_alimentaires, contact_urgence_nom: c.contact_urgence_nom, contact_urgence_telephone: c.contact_urgence_telephone, fiche_sante: c.fiche_sante, notes: c.notes })
        }
      })
    }
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (isEditing) {
      const { error } = await supabase.from('campeurs').update(form).eq('id', id)
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Campeur modifié')
    } else {
      const { error } = await supabase.from('campeurs').insert({ ...form, statut: 'absent' })
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Campeur ajouté')
    }
    navigate('/campeurs')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <button onClick={() => navigate('/campeurs')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="text-2xl font-bold">{isEditing ? 'Modifier' : 'Ajouter'} un campeur</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nom" name="nom" value={form.nom} onChange={handleChange} required />
            <Input label="Prénom" name="prenom" value={form.prenom} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date de naissance" name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange} />
            <Select label="Unité" name="unite" value={form.unite} onChange={handleChange} options={unites.map(u => ({ value: u, label: u }))} />
          </div>
          <Textarea label="Allergies" name="allergies" value={form.allergies} onChange={handleChange} rows={2} />
          <Textarea label="Restrictions alimentaires" name="restrictions_alimentaires" value={form.restrictions_alimentaires} onChange={handleChange} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact urgence - Nom" name="contact_urgence_nom" value={form.contact_urgence_nom} onChange={handleChange} />
            <Input label="Contact urgence - Téléphone" name="contact_urgence_telephone" type="tel" value={form.contact_urgence_telephone} onChange={handleChange} />
          </div>
          <Textarea label="Fiche santé" name="fiche_sante" value={form.fiche_sante} onChange={handleChange} rows={3} />
          <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows={2} />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" type="button" onClick={() => navigate('/campeurs')}>Annuler</Button>
            <Button type="submit" loading={loading}>{isEditing ? 'Modifier' : 'Ajouter'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
