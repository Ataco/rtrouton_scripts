interface CaseOverviewTabProps {
  caseData: any
  onUpdate: () => void
}

export default function CaseOverviewTab({ caseData, onUpdate }: CaseOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Donor Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Donor ID</p>
            <p className="font-medium">{caseData.donorId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hospital</p>
            <p className="font-medium">{caseData.donorHospital || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">OPO</p>
            <p className="font-medium">{caseData.donorOPO || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
            <p className="font-medium">{caseData.donorAge || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Blood Type</p>
            <p className="font-medium">{caseData.donorBloodType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            <p className="font-medium">
              <span className="badge badge-success">{caseData.status}</span>
            </p>
          </div>
        </div>
        {caseData.causeOfDeath && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Cause of Death</p>
            <p className="font-medium">{caseData.causeOfDeath}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Donor Summaries</h2>
        {caseData.donorSummaries && caseData.donorSummaries.length > 0 ? (
          <div className="space-y-2">
            {caseData.donorSummaries.map((summary: any) => (
              <div key={summary.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="font-medium">{summary.fileName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Uploaded {new Date(summary.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <a
                  href={summary.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  View PDF
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No donor summaries uploaded</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Timeline</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">Case Created</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(caseData.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          {caseData.organMatches && caseData.organMatches.map((match: any) => (
            <div key={match.id} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">{match.organType} Match Added</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(match.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
