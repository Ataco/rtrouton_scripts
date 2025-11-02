import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { isAuthenticated, loginWithRedirect } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            Transplant Workflow
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            HIPAA-compliant case management system
          </p>
        </div>

        <button
          onClick={() => loginWithRedirect()}
          className="btn btn-primary w-full text-lg py-3"
        >
          Sign In
        </button>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Secure authentication via Auth0</p>
          <p className="mt-2">All access is logged for HIPAA compliance</p>
        </div>
      </div>
    </div>
  )
}
