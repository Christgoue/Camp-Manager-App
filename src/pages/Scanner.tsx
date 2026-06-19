import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useOffline } from '@/contexts/OfflineContext'
import { useAuth } from '@/contexts/AuthContext'
import { Camera, CameraOff, User, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Campeur } from '@/lib/types'

const statutBadge: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
  present: 'success', sorti: 'warning', sortie_autorisee: 'info', absent: 'danger',
}
const statutLabel: Record<string, string> = {
  present: 'Présent', sorti: 'Sorti', sortie_autorisee: 'Sortie autorisée', absent: 'Absent',
}

export function ScannerPage() {
  const { isOnline, addToSyncQueue } = useOffline()
  const { profile } = useAuth()
  const [scanning, setScanning] = useState(false)
  const [campeur, setCampeur] = useState<Campeur | null>(null)
  const [motif, setMotif] = useState('')
  const [manualId, setManualId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerId = 'qr-scanner'

  useEffect(() => {
    return () => { scannerRef.current?.stop().catch(() => {}) }
  }, [])

  async function startScanner() {
    setScanning(true)
    try {
      scannerRef.current = new Html5Qrcode(scannerContainerId)
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      )
    } catch { toast.error('Erreur d\'accès à la caméra'); setScanning(false) }
  }

  function stopScanner() {
    scannerRef.current?.stop().catch(() => {})
    setScanning(false)
  }

  async function onScanSuccess(decodedText: string) {
    stopScanner()
    try {
      const data = JSON.parse(decodedText)
      if (data.id) {
        setManualId(data.id)
        await findCampeur(data.id)
      } else {
        toast.error('QR code invalide')
      }
    } catch {
      toast.error('QR code invalide')
    }
  }

  async function handleManualSearch() {
    if (!manualId.trim()) return
    await findCampeur(manualId.trim())
  }

  async function findCampeur(id: string) {
    const { data } = await supabase.from('campeurs').select('*').eq('id', id).single()
    if (data) setCampeur(data as Campeur)
    else toast.error('Campeur introuvable')
  }

  async function handleAction(type: 'entree' | 'sortie' | 'sortie_autorisee' | 'urgence') {
    if (!campeur) return
    setActionLoading(true)

    const passage = {
      campeur_id: campeur.id,
      type,
      motif,
      horodatage: new Date().toISOString(),
      created_by: profile?.id || '',
    }

    const newStatut = type === 'entree' ? 'present' : type === 'sortie' ? 'sorti' : type === 'sortie_autorisee' ? 'sortie_autorisee' : 'present'

    if (isOnline) {
      const { error } = await supabase.from('passages').insert(passage)
      if (error) { toast.error(error.message); setActionLoading(false); return }
      await supabase.from('campeurs').update({ statut: newStatut }).eq('id', campeur.id)
      toast.success(`${campeur.prenom} ${campeur.nom} - ${type === 'entree' ? 'Entrée' : type === 'sortie' ? 'Sortie' : type === 'sortie_autorisee' ? 'Sortie autorisée' : 'Urgence'} enregistrée`)
    } else {
      await addToSyncQueue('passages', 'insert', passage)
      await addToSyncQueue('campeurs', 'update', { id: campeur.id, statut: newStatut })
      toast.success('Action enregistrée (hors ligne)')
    }

    setCampeur(null)
    setMotif('')
    setActionLoading(false)
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Scanner</h1>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Ou saisir l'ID du campeur..."
            value={manualId}
            onChange={e => setManualId(e.target.value)}
          />
          <Button variant="secondary" onClick={handleManualSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div id={scannerContainerId} className={`${scanning ? 'block' : 'hidden'} w-full aspect-square bg-black rounded-xl overflow-hidden`} />

        {!scanning ? (
          <Button onClick={startScanner} className="w-full" size="lg">
            <Camera className="h-5 w-5" /> Scanner un QR code
          </Button>
        ) : (
          <Button variant="danger" onClick={stopScanner} className="w-full" size="lg">
            <CameraOff className="h-5 w-5" /> Arrêter le scan
          </Button>
        )}
      </div>

      {campeur && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#2D6A4F]/10 p-3 rounded-full">
              <User className="h-6 w-6 text-[#2D6A4F]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{campeur.nom} {campeur.prenom}</h2>
              <p className="text-sm text-gray-500">{campeur.unite}</p>
              <Badge variant={statutBadge[campeur.statut]}>{statutLabel[campeur.statut]}</Badge>
            </div>
          </div>

          {campeur.allergies && (
            <div className="bg-red-50 text-red-700 text-sm p-2 rounded-lg mb-4">
              ⚠ Allergies : {campeur.allergies}
            </div>
          )}

          <Input
            placeholder="Motif (optionnel)"
            value={motif}
            onChange={e => setMotif(e.target.value)}
            className="mb-3"
          />

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => handleAction('entree')} loading={actionLoading} className="bg-green-600 hover:bg-green-700">
              ✅ Entrée
            </Button>
            <Button onClick={() => handleAction('sortie')} loading={actionLoading} variant="secondary">
              🚪 Sortie
            </Button>
            <Button onClick={() => handleAction('sortie_autorisee')} loading={actionLoading} variant="outline">
              📋 Sortie autorisée
            </Button>
            <Button onClick={() => handleAction('urgence')} loading={actionLoading} variant="danger">
              🆘 Urgence
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
