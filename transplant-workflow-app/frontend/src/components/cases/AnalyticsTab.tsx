export default function AnalyticsTab({ caseData }: { caseData: any }) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Case Analytics</h2>
      <p className="text-gray-500 dark:text-gray-400">
        Detailed analytics and charts coming soon...
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Organs</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {caseData.organMatches?.length || 0}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Case Duration</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {Math.floor((Date.now() - new Date(caseData.createdAt).getTime()) / (1000 * 60 * 60))}h
          </p>
        </div>
      </div>
    </div>
  )
}
