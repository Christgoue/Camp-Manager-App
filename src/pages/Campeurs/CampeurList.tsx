import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useOffline } from '@/contexts/OfflineContext'
import { Plus, Search, Upload, Download, User, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import type { Campeur } from '@/lib/types'

const statutBadge: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
  present: 'success',
  sorti: 'warning',
  sortie_autorisee: 'info',
  absent: 'danger',
}

const statutLabel: Record<string, string> = {
  present: 'Présent',
  sorti: 'Sorti',
  sortie_autorisee: 'Sortie autorisée',
  absent: 'Absent',
}

export function CampeurList() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { getCachedCampeurs, cacheCampeurs, isOnline } = useOffline()
  const [campeurs, setCampeurs] = useState<Campeur[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCampeurs() }, [])

  async function loadCampeurs() {
    try {
      if (isOnline) {
        const { data } = await supabase.from('campeurs').select('*').order('nom')
        if (data) { setCampeurs(data as Campeur[]); await cacheCampeurs() }
      } else {
        setCampeurs(await getCachedCampeurs())
      }
    } catch { setCampeurs(await getCachedCampeurs()) }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce campeur ?')) return
    await supabase.from('campeurs').delete().eq('id', id)
    toast.success('Campeur supprimé')
    loadCampeurs()
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

      const campeursToInsert = rows.map(r => ({
        nom: r['Nom'] || r['nom'] || '',
        prenom: r['Prénom'] || r['prenom'] || '',
        date_naissance: r['Date de naissance'] || r['date_naissance'] || '',
        unite: r['Unité'] || r['unite'] || '',
        allergies: r['Allergies'] || r['allergies'] || '',
        restrictions_alimentaires: r['Restrictions'] || r['restrictions_alimentaires'] || '',
        contact_urgence_nom: r['Contact urgence'] || r['contact_urgence_nom'] || '',
        contact_urgence_telephone: r['Téléphone urgence'] || r['contact_urgence_telephone'] || '',
        fiche_sante: r['Fiche santé'] || r['fiche_sante'] || '',
        notes: r['Notes'] || r['notes'] || '',
        statut: 'absent',
      }))

      const { error } = await supabase.from('campeurs').insert(campeursToInsert)
      if (error) { toast.error('Erreur import: ' + error.message); return }
      toast.success(`${campeursToInsert.length} campeurs importés`)
      loadCampeurs()
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  function handleExport() {
    const ws = XLSX.utils.json_to_sheet(campeurs.map(c => ({
      Nom: c.nom, Prénom: c.prenom, 'Date naissance': c.date_naissance,
      Unité: c.unite, Allergies: c.allergies, 'Restrictions': c.restrictions_alimentaires,
      'Contact urgence': c.contact_urgence_nom, 'Téléphone': c.contact_urgence_telephone,
      Statut: statutLabel[c.statut] || c.statut,
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Campeurs')
    XLSX.writeFile(wb, 'campeurs.xlsx')
    toast.success('Export terminé')
  }

  const filtered = campeurs.filter(c =>
    `${c.nom} ${c.prenom} ${c.unite}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Campeurs</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="secondary" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
                <Upload className="h-4 w-4" /> Importer
              </Button>
              <input id="import-file" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" /> Exporter
              </Button>
            </>
          )}
          <Button size="sm" onClick={() => navigate('/campeurs/new')}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Rechercher un campeur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={search ? 'Aucun résultat' : 'Aucun campeur'} />
      ) : (
        <div className="grid gap-3">
          {filtered.map(c => (
            <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/campeurs/${c.id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#2D6A4F]/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{c.nom} {c.prenom}</p>
                    <p className="text-xs text-gray-500">{c.unite} {c.date_naissance ? `· ${c.date_naissance}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statutBadge[c.statut]}>{statutLabel[c.statut]}</Badge>
                  {isAdmin && (
                    <button onClick={e => { e.stopPropagation(); handleDelete(c.id) }} className="text-red-500 hover:text-red-700 p-1">
                      &times;
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
