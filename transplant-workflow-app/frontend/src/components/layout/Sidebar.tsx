import { NavLink } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import {
  HomeIcon,
  FolderIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const { hasPermission } = useUser()

  const navItems = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard', permission: 'view:cases' },
    { to: '/cases', icon: FolderIcon, label: 'Cases', permission: 'view:cases' },
    { to: '/reports', icon: DocumentTextIcon, label: 'Reports', permission: 'view:reports' },
    { to: '/analytics', icon: ChartBarIcon, label: 'Analytics', permission: 'view:analytics' },
    { to: '/shift/start', icon: ClockIcon, label: 'Shift Start', permission: 'view:cases' },
    { to: '/admin', icon: Cog6ToothIcon, label: 'Admin', permission: 'admin:view-audit' },
  ]

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 shadow-lg">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          if (!hasPermission(item.permission)) return null

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
