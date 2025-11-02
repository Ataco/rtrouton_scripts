import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { casesAPI } from '../../services/api'
import Loading from '../../components/common/Loading'
import CreateCaseModal from '../../components/cases/CreateCaseModal'

export default function CasesPage() {
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  })

  useEffect(() => {
    loadCases()
  }, [filters])

  const loadCases = async () => {
    try {
      const response = await casesAPI.getAll(filters)
      setCases(response.data.cases)
    } catch (error) {
      console.error('Failed to load cases:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Cases</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + New Case
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by Donor ID, Hospital, OPO..."
            className="input flex-1"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Donor ID</th>
                <th className="px-4 py-2 text-left">Hospital</th>
                <th className="px-4 py-2 text-left">OPO</th>
                <th className="px-4 py-2 text-left">Age</th>
                <th className="px-4 py-2 text-left">Blood Type</th>
                <th className="px-4 py-2 text-left">Organs</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((case_) => (
                <tr key={case_.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium">{case_.donorId}</td>
                  <td className="px-4 py-3">{case_.donorHospital || 'N/A'}</td>
                  <td className="px-4 py-3">{case_.donorOPO || 'N/A'}</td>
                  <td className="px-4 py-3">{case_.donorAge || 'N/A'}</td>
                  <td className="px-4 py-3">{case_.donorBloodType || 'N/A'}</td>
                  <td className="px-4 py-3">{case_.organMatches?.length || 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        case_.status === 'ACTIVE'
                          ? 'badge-success'
                          : case_.status === 'COMPLETED'
                          ? 'badge-info'
                          : 'badge-danger'
                      }`}
                    >
                      {case_.status}
                    </span>
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

          {cases.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              No cases found
            </p>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateCaseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadCases()
          }}
        />
      )}
    </div>
  )
}
