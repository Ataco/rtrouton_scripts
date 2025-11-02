import { useAuth0 } from '@auth0/auth0-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useUser } from '../../contexts/UserContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const { logout } = useAuth0()
  const { theme, toggleTheme } = useTheme()
  const { user } = useUser()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            Transplant Workflow
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )}
          </button>

          {user && (
            <div className="text-right">
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.role.name}
              </p>
            </div>
          )}

          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="btn btn-secondary"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
