import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'
import type { Campeur, Passage, Activite, Incident, Message } from '@/lib/types'

interface OfflineContextType {
  isOnline: boolean
  isSyncing: boolean
  syncCount: number
  forceSync: () => Promise<void>
  cacheCampeurs: () => Promise<void>
  cachePassages: () => Promise<void>
  cacheActivites: () => Promise<void>
  cacheIncidents: () => Promise<void>
  getCachedCampeurs: () => Promise<Campeur[]>
  getCachedPassages: (campeurId: string) => Promise<Passage[]>
  getCachedActivites: () => Promise<Activite[]>
  getCachedIncidents: () => Promise<Incident[]>
  addToSyncQueue: (table: string, action: 'insert' | 'update' | 'delete', data: unknown) => Promise<void>
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncCount, setSyncCount] = useState(0)

  useEffect(() => {
    const online = () => { setIsOnline(true); processSyncQueue() }
    const offline = () => setIsOnline(false)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline) }
  }, [])

  const processSyncQueue = useCallback(async () => {
    if (!navigator.onLine) return
    setIsSyncing(true)
    const queue = await db.syncQueue.toArray()
    for (const item of queue) {
      try {
        if (item.action === 'insert') {
          await supabase.from(item.table).insert(item.data as never)
        } else if (item.action === 'update') {
          await supabase.from(item.table).update(item.data as never).eq('id', (item.data as Record<string, string>).id)
        } else if (item.action === 'delete') {
          await supabase.from(item.table).delete().eq('id', (item.data as Record<string, string>).id)
        }
        await db.syncQueue.delete(item.id!)
      } catch { /* will retry on next sync */ }
    }
    setSyncCount(prev => prev + 1)
    setIsSyncing(false)
  }, [])

  useEffect(() => {
    if (isOnline) processSyncQueue()
  }, [isOnline, processSyncQueue])

  const forceSync = useCallback(async () => {
    await processSyncQueue()
  }, [processSyncQueue])

  async function cacheCampeurs() {
    if (!navigator.onLine) return
    const { data } = await supabase.from('campeurs').select('*')
    if (data) { await db.campeurs.clear(); await db.campeurs.bulkPut(data as Campeur[]) }
  }

  async function cachePassages() {
    if (!navigator.onLine) return
    const { data } = await supabase.from('passages').select('*')
    if (data) { await db.passages.clear(); await db.passages.bulkPut(data as Passage[]) }
  }

  async function cacheActivites() {
    if (!navigator.onLine) return
    const { data } = await supabase.from('activites').select('*')
    if (data) { await db.activites.clear(); await db.activites.bulkPut(data as Activite[]) }
  }

  async function cacheIncidents() {
    if (!navigator.onLine) return
    const { data } = await supabase.from('incidents').select('*')
    if (data) { await db.incidents.clear(); await db.incidents.bulkPut(data as Incident[]) }
  }

  async function getCachedCampeurs() { return db.campeurs.toArray() }
  async function getCachedPassages(campeurId: string) { return db.passages.where('campeur_id').equals(campeurId).toArray() }
  async function getCachedActivites() { return db.activites.toArray() }
  async function getCachedIncidents() { return db.incidents.toArray() }

  async function addToSyncQueue(table: string, action: 'insert' | 'update' | 'delete', data: unknown) {
    await db.syncQueue.add({ table, action, data, created_at: new Date().toISOString() })
    if (navigator.onLine) processSyncQueue()
  }

  return (
    <OfflineContext.Provider value={{ isOnline, isSyncing, syncCount, forceSync, cacheCampeurs, cachePassages, cacheActivites, cacheIncidents, getCachedCampeurs, getCachedPassages, getCachedActivites, getCachedIncidents, addToSyncQueue }}>
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const ctx = useContext(OfflineContext)
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider')
  return ctx
}
