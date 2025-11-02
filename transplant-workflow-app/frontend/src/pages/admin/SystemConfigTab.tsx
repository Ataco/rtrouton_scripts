export default function SystemConfigTab() {
  const configs = [
    { key: 'max_file_size', value: '10MB', category: 'Upload' },
    { key: 'session_timeout', value: '30 minutes', category: 'Security' },
    { key: 'audit_retention_days', value: '2555 days (7 years)', category: 'Compliance' },
    { key: 'notification_email', value: 'admin@hospital.org', category: 'Notifications' },
  ]

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">System Configuration</h2>

      <div className="space-y-4">
        {configs.map((config) => (
          <div key={config.key} className="border dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{config.key}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Category: {config.category}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium">{config.value}</span>
                <button className="btn btn-secondary btn-sm">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Preservation Tolerances</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Organ</th>
                <th className="px-4 py-2 text-left">Modality</th>
                <th className="px-4 py-2 text-left">Max Cold (min)</th>
                <th className="px-4 py-2 text-left">Max Warm (min)</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t dark:border-gray-700">
                <td className="px-4 py-3">Heart</td>
                <td className="px-4 py-3">ICE</td>
                <td className="px-4 py-3">240</td>
                <td className="px-4 py-3">60</td>
                <td className="px-4 py-3">
                  <button className="text-primary-600 dark:text-primary-400 hover:underline">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
