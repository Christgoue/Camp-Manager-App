import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, QrCode, MessageSquare, Settings, LogOut, TreePine } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/campeurs', icon: Users, label: 'Campeurs' },
  { to: '/activites', icon: Calendar, label: 'Activités' },
  { to: '/scanner', icon: QrCode, label: 'Scanner' },
  { to: '/messagerie', icon: MessageSquare, label: 'Messagerie' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
]

export function Sidebar() {
  const { signOut, profile } = useAuth()

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
        <TreePine className="h-7 w-7 text-[#2D6A4F]" />
        <span className="text-lg font-bold text-[#2D6A4F]">Camp Suivi</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[#2D6A4F] text-white' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2 truncate">{profile?.nom}</div>
        <button onClick={signOut} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors w-full">
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </div>
    </aside>
  )
}
