import { useState } from 'react'

interface OrganMatchesTabProps {
  caseData: any
  onUpdate: () => void
}

export default function OrganMatchesTab({ caseData, onUpdate }: OrganMatchesTabProps) {
  const organMatches = caseData.organMatches || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OFFERED':
        return 'badge-info'
      case 'ACCEPTED':
        return 'badge-success'
      case 'DECLINED':
        return 'badge-danger'
      case 'COMPLETED':
        return 'badge-success'
      default:
        return 'badge-info'
    }
  }

  return (
    <div className="space-y-6">
      {organMatches.map((match: any) => (
        <div key={match.id} className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">{match.organType}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Match ID: {match.matchId}
              </p>
            </div>
            <span className={`badge ${getStatusColor(match.status)}`}>
              {match.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recipient Hospital</p>
              <p className="font-medium">{match.recipientHospital || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Surgeon</p>
              <p className="font-medium">{match.recipientSurgeon || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Coordinator</p>
              <p className="font-medium">
                {match.assignedCoordinator
                  ? `${match.assignedCoordinator.firstName} ${match.assignedCoordinator.lastName}`
                  : 'Unassigned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Workflow Stage</p>
              <p className="font-medium">{match.workflowStage || 'Not Started'}</p>
            </div>
          </div>

          {match.analytics && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Analytics</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Cold Ischemia</p>
                  <p className="font-medium">{match.analytics.totalColdIschemia || 0} min</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Warm Ischemia</p>
                  <p className="font-medium">{match.analytics.totalWarmIschemia || 0} min</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Preservation Score</p>
                  <p className="font-medium">{match.analytics.preservationScore?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <button className="btn btn-secondary">View Reports</button>
            <button className="btn btn-secondary">Manage Preservation</button>
            <button className="btn btn-primary">Update Status</button>
          </div>
        </div>
      ))}

      {organMatches.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No organ matches yet</p>
          <button className="btn btn-primary">Add Organ Match</button>
        </div>
      )}
    </div>
  )
}
