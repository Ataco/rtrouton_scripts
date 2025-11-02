import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { casesAPI, organMatchesAPI } from '../services/api'
import { useUser } from '../contexts/UserContext'
import Loading from '../components/common/Loading'

export default function DashboardPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeCases: 0,
    myAssignments: 0,
    pendingReports: 0,
  })
  const [recentCases, setRecentCases] = useState<any[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [casesRes, assignmentsRes] = await Promise.all([
        casesAPI.getAll({ status: 'ACTIVE' }),
        organMatchesAPI.getMyAssignments(),
      ])

      setStats({
        activeCases: casesRes.data.cases.length,
        myAssignments: assignmentsRes.data.matches.length,
        pendingReports: 0, // Calculate based on your logic
      })

      setRecentCases(casesRes.data.cases.slice(0, 5))
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Active Cases
          </h3>
          <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            {stats.activeCases}
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            My Assignments
          </h3>
          <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            {stats.myAssignments}
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Pending Reports
          </h3>
          <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            {stats.pendingReports}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Cases</h2>
          <Link to="/cases" className="text-primary-600 dark:text-primary-400 hover:underline">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Donor ID</th>
                <th className="px-4 py-2 text-left">OPO</th>
                <th className="px-4 py-2 text-left">Organs</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((case_) => (
                <tr key={case_.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-3 font-medium">{case_.donorId}</td>
                  <td className="px-4 py-3">{case_.donorOPO || 'N/A'}</td>
                  <td className="px-4 py-3">{case_.organMatches?.length || 0}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-success">{case_.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(case_.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/cases/${case_.id}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentCases.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recent cases found
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/cases/new" className="btn btn-primary w-full">
              Create New Case
            </Link>
            <Link to="/shift/start" className="btn btn-secondary w-full">
              Start Shift
            </Link>
            <Link to="/reports" className="btn btn-secondary w-full">
              View Reports
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">System Info</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Logged in as:</span> {user?.email}
            </p>
            <p>
              <span className="font-medium">Role:</span> {user?.role.name}
            </p>
            <p>
              <span className="font-medium">Last login:</span>{' '}
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
