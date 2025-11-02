import { useState } from 'react'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  })
  const [selectedOrgan, setSelectedOrgan] = useState('')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Organ Type</label>
            <select
              className="input"
              value={selectedOrgan}
              onChange={(e) => setSelectedOrgan(e.target.value)}
            >
              <option value="">All Organs</option>
              <option value="HEART">Heart</option>
              <option value="LUNG">Lung</option>
              <option value="LIVER">Liver</option>
              <option value="KIDNEY">Kidney</option>
              <option value="PANCREAS">Pancreas</option>
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              className="input"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              className="input"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="btn btn-primary">Generate Report</button>
          <button className="btn btn-secondary ml-2">Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Cold Ischemia</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">245 min</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Warm Ischemia</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">32 min</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Transport Time</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">156 min</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Preservation Score</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">87.2</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Analytics Features</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Ischemia window tracking (cold and warm)</li>
          <li>Perfusion modality history</li>
          <li>Transport duration analysis</li>
          <li>Filter by organ, OPO, hospital</li>
          <li>Export to CSV</li>
          <li>Interactive charts and graphs</li>
          <li>Preservation quality scoring</li>
          <li>Risk factor identification</li>
        </ul>
      </div>
    </div>
  )
}
