import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { useOffline } from '@/contexts/OfflineContext'
import { Send, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Message } from '@/lib/types'

export function Messagerie() {
  const { profile } = useAuth()
  const { isOnline, addToSyncQueue } = useOffline()
  const [messages, setMessages] = useState<Message[]>([])
  const [contenu, setContenu] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages() {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(100)
    if (data) setMessages(data as Message[])
    setLoading(false)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!contenu.trim()) return

    const msg = {
      user_id: profile?.id || '',
      user_nom: profile?.nom || 'Inconnu',
      contenu: contenu.trim(),
    }

    if (isOnline) {
      const { error } = await supabase.from('messages').insert(msg)
      if (error) { toast.error(error.message); return }
    } else {
      await addToSyncQueue('messages', 'insert', msg)
      toast.success('Message enregistré (hors ligne)')
    }
    setContenu('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Messagerie</h1>

      <Card className="flex-1 overflow-y-auto mb-4 p-3">
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-[#2D6A4F] border-t-transparent rounded-full" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p className="text-sm">Aucun message</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.user_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 ${msg.user_id === profile?.id ? 'bg-[#2D6A4F] text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {msg.user_id !== profile?.id && (
                    <p className="text-xs font-semibold text-[#2D6A4F] mb-0.5">{msg.user_nom}</p>
                  )}
                  <p className="text-sm">{msg.contenu}</p>
                  <p className={`text-xs mt-0.5 ${msg.user_id === profile?.id ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </Card>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          placeholder="Votre message..."
          className="flex-1"
        />
        <Button type="submit" disabled={!contenu.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
