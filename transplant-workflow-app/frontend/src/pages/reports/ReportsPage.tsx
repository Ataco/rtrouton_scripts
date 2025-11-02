import { useState } from 'react'

export default function ReportsPage() {
  const [selectedOrgan, setSelectedOrgan] = useState('')

  const reportTypes = [
    { id: 'RECOVERY_ONCALL', name: 'Recovery Coordinator On-Call Record', organs: ['ALL'] },
    { id: 'THORACIC', name: 'Thoracic Reporting Record', organs: ['HEART', 'LUNG', 'HEART_LUNG'] },
    { id: 'LIVER', name: 'Liver Reporting Record', organs: ['LIVER'] },
    { id: 'KIDNEY', name: 'Kidney Reporting Record', organs: ['KIDNEY'] },
    { id: 'LUNG', name: 'Lung Reporting Record', organs: ['LUNG'] },
    { id: 'PANCREAS', name: 'Pancreas Reporting Record', organs: ['PANCREAS'] },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reporting Forms</h1>

      <div className="card mb-6">
        <div className="flex gap-4">
          <select
            className="input"
            value={selectedOrgan}
            onChange={(e) => setSelectedOrgan(e.target.value)}
          >
            <option value="">All Organ Types</option>
            <option value="HEART">Heart</option>
            <option value="LUNG">Lung</option>
            <option value="LIVER">Liver</option>
            <option value="KIDNEY">Kidney</option>
            <option value="PANCREAS">Pancreas</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((reportType) => (
          <div key={reportType.id} className="card hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">{reportType.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Organs: {reportType.organs.join(', ')}
            </p>
            <div className="flex space-x-2">
              <button className="btn btn-primary flex-1">Fill Form</button>
              <button className="btn btn-secondary flex-1">View Reports</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Report Features</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Responsive forms (mobile/tablet/desktop)</li>
          <li>Auto-submit to backend with validation</li>
          <li>Read-only view for completed reports</li>
          <li>Admin-editable validation rules</li>
          <li>Linked to analytics</li>
          <li>Dark mode support</li>
        </ul>
      </div>
    </div>
  )
}
