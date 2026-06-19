import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useOffline } from '@/contexts/OfflineContext'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export function AppLayout() {
  const { isOnline, isSyncing, syncCount, forceSync } = useOffline()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="md:ml-64 pb-16 md:pb-0">
        <div className={`sticky top-0 z-30 px-4 py-2 text-xs font-medium flex items-center justify-between ${isOnline ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
          <div className="flex items-center gap-1.5">
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
            {isSyncing && (
              <span className="flex items-center gap-1 ml-2">
                <RefreshCw className="h-3 w-3 animate-spin" /> Synchronisation...
              </span>
            )}
          </div>
          {!isOnline && (
            <button onClick={forceSync} className="underline hover:no-underline">
              Réessayer
            </button>
          )}
          {isOnline && syncCount > 0 && (
            <span className="text-gray-500">Sync #{syncCount}</span>
          )}
        </div>

        <main className="p-4 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
