import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { authAPI } from '../services/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: {
    id: string
    name: string
    permissions: string[]
  }
}

interface UserContextType {
  user: User | null
  loading: boolean
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, getAccessTokenSilently, user: auth0User } = useAuth0()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      syncUser()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, auth0User])

  const syncUser = async () => {
    try {
      const token = await getAccessTokenSilently()
      localStorage.setItem('token', token)

      const response = await authAPI.syncUser({
        email: auth0User!.email,
        firstName: auth0User!.given_name || auth0User!.name?.split(' ')[0] || '',
        lastName: auth0User!.family_name || auth0User!.name?.split(' ')[1] || '',
      })

      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to sync user:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission: string) => {
    if (!user) return false
    return (
      user.role.permissions.includes(permission) ||
      user.role.permissions.includes('*')
    )
  }

  const hasRole = (role: string) => {
    if (!user) return false
    return user.role.name === role
  }

  return (
    <UserContext.Provider value={{ user, loading, hasPermission, hasRole }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
