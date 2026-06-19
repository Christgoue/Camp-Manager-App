import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, QrCode, MessageSquare, Settings } from 'lucide-react'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/campeurs', icon: Users, label: 'Campeurs' },
  { to: '/activites', icon: Calendar, label: 'Activités' },
  { to: '/scanner', icon: QrCode, label: 'Scanner' },
  { to: '/messagerie', icon: MessageSquare, label: 'Messages' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium transition-colors ${isActive ? 'text-[#2D6A4F]' : 'text-gray-500 hover:text-gray-700'}`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
