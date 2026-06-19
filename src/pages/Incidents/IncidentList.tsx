import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { useOffline } from '@/contexts/OfflineContext'
import { Plus, AlertTriangle, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Incident } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { IncidentForm } from './IncidentForm'

const graviteBadge: Record<string, 'warning' | 'danger' | 'info'> = {
  faible: 'info', moyen: 'warning', eleve: 'danger',
}
const statutBadge: Record<string, 'default' | 'warning' | 'success'> = {
  ouvert: 'default', en_cours: 'warning', resolu: 'success',
}

export function IncidentList() {
  const { getCachedIncidents, cacheIncidents, isOnline } = useOffline()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [campeurs, setCampeurs] = useState<Record<string, string>>({})

  useEffect(() => { loadIncidents() }, [])

  async function loadIncidents() {
    try {
      if (isOnline) {
        const { data } = await supabase.from('incidents').select('*').order('created_at', { ascending: false })
        if (data) { setIncidents(data as Incident[]); await cacheIncidents() }
      } else {
        setIncidents(await getCachedIncidents())
      }
    } catch { setIncidents(await getCachedIncidents()) }
    setLoading(false)
    const { data: cData } = await supabase.from('campeurs').select('id, nom, prenom')
    if (cData) {
      const map: Record<string, string> = {}
      cData.forEach((c: { id: string; nom: string; prenom: string }) => { map[c.id] = `${c.nom} ${c.prenom}` })
      setCampeurs(map)
    }
  }

  async function handleResolve(id: string) {
    await supabase.from('incidents').update({ statut: 'resolu' }).eq('id', id)
    toast.success('Incident résolu')
    loadIncidents()
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full" /></div>

  const filtered = incidents.filter(i => {
    const matchesSearch = i.description.toLowerCase().includes(search.toLowerCase()) || i.type.toLowerCase().includes(search.toLowerCase())
    const matchesStatut = filterStatut === 'tous' || i.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Incidents</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Signaler
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
          options={[
            { value: 'tous', label: 'Tous' },
            { value: 'ouvert', label: 'Ouvert' },
            { value: 'en_cours', label: 'En cours' },
            { value: 'resolu', label: 'Résolu' },
          ]}
          className="w-32"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Aucun incident" />
      ) : (
        <div className="grid gap-3">
          {filtered.map(inc => (
            <Card key={inc.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`h-4 w-4 ${inc.gravite === 'eleve' ? 'text-red-500' : inc.gravite === 'moyen' ? 'text-yellow-500' : 'text-blue-500'}`} />
                    <span className="font-semibold text-sm">{inc.type}</span>
                    <Badge variant={graviteBadge[inc.gravite]}>{inc.gravite}</Badge>
                    <Badge variant={statutBadge[inc.statut]}>{inc.statut}</Badge>
                  </div>
                  <p className="text-sm text-gray-700">{inc.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{campeurs[inc.campeur_id] || 'Inconnu'}</span>
                    <span>·</span>
                    <span>{new Date(inc.created_at).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
                {inc.statut !== 'resolu' && (
                  <Button variant="ghost" size="sm" onClick={() => handleResolve(inc.id)}>
                    Résoudre
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); loadIncidents() }} title="Signaler un incident">
        <IncidentForm onDone={() => { setShowForm(false); loadIncidents() }} campeurs={campeurs} />
      </Modal>
    </div>
  )
}
