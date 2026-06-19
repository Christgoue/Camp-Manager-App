import { useAuth } from '@/contexts/AuthContext'
import { useOffline } from '@/contexts/OfflineContext'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { UserManagement } from './UserManagement'
import { RefreshCw, Shield, Wifi, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const { profile, isAdmin, signOut } = useAuth()
  const { isOnline, isSyncing, forceSync, syncCount } = useOffline()

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      <Card>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4" /> Profil
        </CardTitle>
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Nom</span><span>{profile?.nom}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{profile?.email}</span></div>
          <div className="flex justify-between">
            <span className="text-gray-500">Rôle</span>
            <Badge variant={profile?.role === 'admin' ? 'info' : 'default'}>{profile?.role === 'admin' ? 'Admin' : 'Chef d\'unité'}</Badge>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-4 w-4" /> Synchronisation
        </CardTitle>
        <div className="mt-2 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Statut</span>
            <Badge variant={isOnline ? 'success' : 'danger'}>{isOnline ? 'En ligne' : 'Hors ligne'}</Badge>
          </div>
          {syncCount > 0 && (
            <div className="flex justify-between text-sm"><span className="text-gray-500">Syncs effectués</span><span>{syncCount}</span></div>
          )}
          <Button onClick={forceSync} loading={isSyncing} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" /> Forcer la synchronisation
          </Button>
        </div>
      </Card>

      {isAdmin && (
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Gestion des utilisateurs
          </CardTitle>
          <div className="mt-3">
            <UserManagement />
          </div>
        </Card>
      )}

      <div className="flex justify-center pt-4">
        <Button variant="danger" onClick={signOut}>Déconnexion</Button>
      </div>
    </div>
  )
}
