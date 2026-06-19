import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Utensils, AlertTriangle } from 'lucide-react'
import type { Campeur } from '@/lib/types'

export function Repas() {
  const [campeurs, setCampeurs] = useState<Campeur[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    supabase.from('campeurs').select('*').then(({ data }) => {
      if (data) setCampeurs(data as Campeur[])
      setLoading(false)
    })
  }, [])

  const withAllergies = campeurs.filter(c => c.allergies && c.allergies.trim())
  const withRestrictions = campeurs.filter(c => c.restrictions_alimentaires && c.restrictions_alimentaires.trim())

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Gestion des repas</h1>
      <p className="text-sm text-gray-500">{today}</p>

      <Card className="border-amber-200 bg-amber-50">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle>Alertes allergies</CardTitle>
        </div>
        <p className="text-sm text-amber-800 mb-3">
          {withAllergies.length} campeur(s) avec allergies, {withRestrictions.length} avec restrictions alimentaires
        </p>

        {withAllergies.length > 0 && (
          <div className="space-y-1">
            {withAllergies.map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2">
                <div>
                  <span className="font-medium">{c.nom} {c.prenom}</span>
                  <span className="text-gray-500 ml-2">({c.unite})</span>
                </div>
                <Badge variant="danger">{c.allergies}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {withRestrictions.length > 0 && (
        <Card>
          <CardTitle>Restrictions alimentaires</CardTitle>
          <div className="space-y-1 mt-2">
            {withRestrictions.map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <div>
                  <span className="font-medium">{c.nom} {c.prenom}</span>
                  <span className="text-gray-500 ml-2">({c.unite})</span>
                </div>
                <Badge variant="warning">{c.restrictions_alimentaires}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-4 w-4" /> Campeurs présents aujourd'hui
        </CardTitle>
        <p className="text-sm text-gray-500 mt-2">
          {campeurs.filter(c => c.statut === 'present').length} campeurs présents sur le site
        </p>
      </Card>
    </div>
  )
}
