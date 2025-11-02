import { useEffect, useState } from 'react'
import { casesAPI } from '../../services/api'
import Loading from '../../components/common/Loading'

export default function ShiftStartPage() {
  const [loading, setLoading] = useState(true)
  const [unclaimedCases, setUnclaimedCases] = useState<any[]>([])

  useEffect(() => {
    loadUnclaimedCases()
  }, [])

  const loadUnclaimedCases = async () => {
    try {
      const response = await casesAPI.getUnclaimedForShift()
      setUnclaimedCases(response.data.cases)
    } catch (error) {
      console.error('Failed to load unclaimed cases:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Shift Start</h1>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Unclaimed Cases from Yesterday</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Review and claim cases that need coordinator assignment
        </p>

        {unclaimedCases.length > 0 ? (
          <div className="space-y-4">
            {unclaimedCases.map((case_) => (
              <div key={case_.id} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{case_.donorId}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {case_.donorOPO} • {case_.organMatches?.length || 0} organs
                    </p>
                  </div>
                  <button className="btn btn-primary">Claim Case</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            No unclaimed cases at this time
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Shift Management Features</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>View unclaimed cases from previous shifts</li>
          <li>Inherit unfinished cases from prior shift</li>
          <li>Case handoff logic between coordinators</li>
          <li>Shift notes and comments</li>
          <li>Assignment history tracking</li>
          <li>Coordinator assignment dropdown in workflows</li>
        </ul>
      </div>
    </div>
  )
}
