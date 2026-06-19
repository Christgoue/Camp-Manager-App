import { Inbox } from 'lucide-react'

export function EmptyState({ message = 'Aucune donnée' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Inbox className="h-12 w-12 mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
