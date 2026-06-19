import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Users, Activity, AlertTriangle, Utensils } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#2D6A4F', '#40916C', '#52B788', '#95D5B2']

interface DashboardData {
  total: number
  present: number
  absent: number
  incidents: number
  activites: number
  activitesToday: number
}

export function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData>({ total: 0, present: 0, absent: 0, incidents: 0, activites: 0, activitesToday: 0 })
  const [uniteData, setUniteData] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [campeurs, incidents, activites] = await Promise.all([
      supabase.from('campeurs').select('*'),
      supabase.from('incidents').select('*').neq('statut', 'resolu'),
      supabase.from('activites').select('*'),
    ])

    const campeursData = campeurs.data || []
    const today = new Date().toISOString().split('T')[0]

    const units: Record<string, number> = {}
    campeursData.forEach((c: { unite: string }) => {
      units[c.unite] = (units[c.unite] || 0) + 1
    })

    setData({
      total: campeursData.length,
      present: campeursData.filter((c: { statut: string }) => c.statut === 'present').length,
      absent: campeursData.filter((c: { statut: string }) => c.statut === 'absent').length,
      incidents: incidents.data?.length || 0,
      activites: activites.data?.length || 0,
      activitesToday: activites.data?.filter((a: { date: string }) => a.date === today).length || 0,
    })

    setUniteData(Object.entries(units).map(([name, count]) => ({ name, count })))
    setLoading(false)
  }

  const stats = [
    { label: 'Campeurs', value: data.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/campeurs' },
    { label: 'Présents', value: data.present, icon: Users, color: 'text-green-600', bg: 'bg-green-50', link: '/campeurs' },
    { label: 'Activités aujourd\'hui', value: data.activitesToday, icon: Activity, color: 'text-[#2D6A4F]', bg: 'bg-emerald-50', link: '/activites' },
    { label: 'Incidents en cours', value: data.incidents, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', link: '/incidents' },
  ]

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(stat.link)}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle className="mb-4">Répartition par unité</CardTitle>
          {uniteData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={uniteData} cx="50%" cy="50%" outerRadius={80} dataKey="count" label={({ name }) => name}>
                  {uniteData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">Aucune donnée</p>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">Statut des campeurs</CardTitle>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Présent', count: data.present },
              { name: 'Absent', count: data.absent },
            ]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
