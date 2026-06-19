import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { UserPlus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile } from '@/lib/types'

export function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'chef' as 'admin' | 'chef' })

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('nom')
    if (data) setUsers(data as Profile[])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.admin.createUser({
      email: form.email,
      password: form.password,
      email_confirm: true,
      user_metadata: { nom: form.nom, role: form.role },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success(`Utilisateur ${form.email} créé`)
    setForm({ nom: '', email: '', password: '', role: 'chef' })
    setShowForm(false)
    loadUsers()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet utilisateur ?')) return
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) { toast.error(error.message); return }
    toast.success('Utilisateur supprimé')
    loadUsers()
  }

  if (loading && users.length === 0) return <div className="animate-spin h-5 w-5 border-4 border-[#2D6A4F] border-t-transparent rounded-full mx-auto" />

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{users.length} utilisateur(s)</span>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <UserPlus className="h-4 w-4" /> Créer
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <Input label="Nom" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          <Input label="Mot de passe temporaire" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          <Select
            label="Rôle"
            value={form.role}
            onChange={e => setForm(p => ({ ...p, role: e.target.value as 'admin' | 'chef' }))}
            options={[{ value: 'admin', label: 'Admin' }, { value: 'chef', label: "Chef d'unité" }]}
          />
          <Button type="submit" loading={loading} className="w-full">Créer l'utilisateur</Button>
        </form>
      )}

      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
            <div>
              <span className="font-medium">{u.nom}</span>
              <span className="text-gray-500 ml-2">{u.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={u.role === 'admin' ? 'info' : 'default'}>{u.role === 'admin' ? 'Admin' : 'Chef'}</Badge>
              <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
