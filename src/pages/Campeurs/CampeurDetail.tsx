import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useOffline } from '@/contexts/OfflineContext'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, QrCode, Printer, Download, Clock, AlertTriangle, User } from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'
import type { Campeur, Passage } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'

const statutBadge: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
  present: 'success', sorti: 'warning', sortie_autorisee: 'info', absent: 'danger',
}
const statutLabel: Record<string, string> = {
  present: 'Présent', sorti: 'Sorti', sortie_autorisee: 'Sortie autorisée', absent: 'Absent',
}

export function CampeurDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { getCachedPassages, cachePassages, isOnline } = useOffline()
  const [campeur, setCampeur] = useState<Campeur | null>(null)
  const [passages, setPassages] = useState<Passage[]>([])
  const [loading, setLoading] = useState(true)
  const [qrModal, setQrModal] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function loadData() {
    const { data: campeurData } = await supabase.from('campeurs').select('*').eq('id', id).single()
    if (campeurData) {
      setCampeur(campeurData as Campeur)
      await generateQR(campeurData as Campeur)
    }

    if (isOnline) {
      const { data: pData } = await supabase.from('passages').select('*').eq('campeur_id', id).order('horodatage', { ascending: false })
      if (pData) { setPassages(pData as Passage[]); await cachePassages() }
    } else {
      setPassages(await getCachedPassages(id!))
    }
    setLoading(false)
  }

  async function generateQR(c: Campeur) {
    const dataUrl = await QRCode.toDataURL(JSON.stringify({ id: c.id, nom: c.nom, prenom: c.prenom }), { width: 300 })
    setQrDataUrl(dataUrl)
  }

  async function handlePrintBadge() {
    const win = window.open('', '_blank')
    if (!win || !campeur) return
    win.document.write(`
      <html><head><title>Badge - ${campeur.nom} ${campeur.prenom}</title>
      <style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
      .badge{text-align:center;border:2px solid #2D6A4F;border-radius:16px;padding:32px;width:350px}
      .badge img{width:200px;height:200px;margin:16px auto}
      .badge h2{color:#2D6A4F;margin:8px 0 4px}
      .badge p{color:#666;margin:0}
      </style></head><body>
      <div class="badge"><h2>${campeur.nom} ${campeur.prenom}</h2><p>${campeur.unite}</p>
      <img src="${qrDataUrl}" alt="QR Code" /><p>Scannez ce badge pour le check-in</p></div>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full" /></div>
  if (!campeur) return <p className="text-center py-12 text-gray-500">Campeur introuvable</p>

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <button onClick={() => navigate('/campeurs')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#2D6A4F]/10 p-3 rounded-full">
              <User className="h-6 w-6 text-[#2D6A4F]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{campeur.nom} {campeur.prenom}</h1>
              <p className="text-sm text-gray-500">{campeur.unite}</p>
              <Badge variant={statutBadge[campeur.statut]} className="mt-1">{statutLabel[campeur.statut]}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setQrModal(true)}>
              <QrCode className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrintBadge}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Informations personnelles</CardTitle>
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between"><span className="text-gray-500">Date naissance</span><span>{campeur.date_naissance || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Unité</span><span>{campeur.unite}</span></div>
          </dl>
        </Card>

        <Card>
          <CardTitle>Contact d'urgence</CardTitle>
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between"><span className="text-gray-500">Nom</span><span>{campeur.contact_urgence_nom || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span>{campeur.contact_urgence_telephone || '-'}</span></div>
          </dl>
        </Card>

        <Card>
          <CardTitle>Santé & Allergies</CardTitle>
          <div className="text-sm mt-2 space-y-2">
            <div><span className="text-gray-500">Allergies :</span><p>{campeur.allergies || 'Aucune'}</p></div>
            <div><span className="text-gray-500">Restrictions :</span><p>{campeur.restrictions_alimentaires || 'Aucune'}</p></div>
            <div><span className="text-gray-500">Fiche santé :</span><p>{campeur.fiche_sante || '-'}</p></div>
          </div>
        </Card>

        <Card>
          <CardTitle>Notes</CardTitle>
          <p className="text-sm mt-2 text-gray-700">{campeur.notes || 'Aucune note'}</p>
        </Card>
      </div>

      {isAdmin && (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/campeurs/${id}/edit`)}>Modifier</Button>
        </div>
      )}

      <Card>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" /> Historique des passages
        </CardTitle>
        <div className="space-y-2 mt-2">
          {passages.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun passage</p>
          ) : (
            passages.slice(0, 20).map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant={p.type === 'entree' ? 'success' : p.type === 'urgence' ? 'danger' : 'warning'}>
                    {p.type === 'entree' ? 'Entrée' : p.type === 'sortie' ? 'Sortie' : p.type === 'sortie_autorisee' ? 'Autorisé' : 'Urgence'}
                  </Badge>
                  <span className="text-gray-600">{p.motif || '-'}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(p.horodatage).toLocaleString('fr-FR')}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal open={qrModal} onClose={() => setQrModal(false)} title="QR Code du campeur">
        <div className="flex flex-col items-center gap-4">
          <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
          <p className="text-sm text-gray-500">Scannez ce code pour le check-in/out</p>
          <Button onClick={handlePrintBadge}><Printer className="h-4 w-4" /> Imprimer le badge</Button>
        </div>
      </Modal>
    </div>
  )
}
