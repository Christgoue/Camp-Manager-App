import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useOffline } from '@/contexts/OfflineContext'
import { Plus, Upload, Download, Calendar, MapPin, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import type { Activite } from '@/lib/types'

export function ActivityList() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { getCachedActivites, cacheActivites, isOnline } = useOffline()
  const [activites, setActivites] = useState<Activite[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadActivites() }, [])

  async function loadActivites() {
    try {
      if (isOnline) {
        const { data } = await supabase.from('activites').select('*').order('date').order('heure_debut')
        if (data) { setActivites(data as Activite[]); await cacheActivites() }
      } else {
        setActivites(await getCachedActivites())
      }
    } catch { setActivites(await getCachedActivites()) }
    setLoading(false)
  }

  function groupByDate(acts: Activite[]) {
    const groups: Record<string, Activite[]> = {}
    acts.forEach(a => {
      const d = a.date || 'À venir'
      if (!groups[d]) groups[d] = []
      groups[d].push(a)
    })
    return groups
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, string>[]
      const toInsert = rows.map(r => ({
        titre: r['Titre'] || r['titre'] || '',
        description: r['Description'] || r['description'] || '',
        lieu: r['Lieu'] || r['lieu'] || '',
        date: r['Date'] || r['date'] || '',
        heure_debut: r['Début'] || r['heure_debut'] || '',
        heure_fin: r['Fin'] || r['heure_fin'] || '',
        participants: [],
      }))
      const { error } = await supabase.from('activites').insert(toInsert)
      if (error) { toast.error('Erreur import: ' + error.message); return }
      toast.success(`${toInsert.length} activités importées`)
      loadActivites()
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  function handleExport() {
    const ws = XLSX.utils.json_to_sheet(activites.map(a => ({
      Titre: a.titre, Description: a.description, Lieu: a.lieu,
      Date: a.date, Début: a.heure_debut, Fin: a.heure_fin,
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Activités')
    XLSX.writeFile(wb, 'activites.xlsx')
    toast.success('Export terminé')
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full" /></div>

  const filtered = activites.filter(a =>
    a.titre.toLowerCase().includes(search.toLowerCase()) ||
    a.lieu.toLowerCase().includes(search.toLowerCase())
  )
  const grouped = groupByDate(filtered)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Activités</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="secondary" size="sm" onClick={() => document.getElementById('import-acts')?.click()}>
                <Upload className="h-4 w-4" /> Importer
              </Button>
              <input id="import-acts" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" /> Exporter
              </Button>
            </>
          )}
          <Button size="sm" onClick={() => navigate('/activites/new')}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>
      </div>

      <Input
        placeholder="Rechercher une activité..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <EmptyState message={search ? 'Aucun résultat' : 'Aucune activité'} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, acts]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{date}</h3>
              <div className="grid gap-3">
                {acts.map(a => (
                  <Card key={a.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{a.titre}</h3>
                        <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {a.lieu}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.heure_debut} - {a.heure_fin}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {a.date}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <button onClick={() => navigate(`/activites/${a.id}/edit`)} className="text-[#2D6A4F] hover:underline text-sm ml-2">
                          Modifier
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
