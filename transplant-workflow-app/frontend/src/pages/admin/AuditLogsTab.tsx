export default function AuditLogsTab() {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Complete audit trail for HIPAA compliance
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="label">User</label>
          <select className="input">
            <option value="">All Users</option>
          </select>
        </div>
        <div>
          <label className="label">Resource</label>
          <select className="input">
            <option value="">All Resources</option>
            <option value="DonorCase">Donor Case</option>
            <option value="OrganMatch">Organ Match</option>
            <option value="ReportingRecord">Reports</option>
          </select>
        </div>
        <div>
          <label className="label">Action</label>
          <select className="input">
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="VIEW">View</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Timestamp</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Resource</th>
              <th className="px-4 py-2 text-left">IP Address</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t dark:border-gray-700">
              <td className="px-4 py-3" colSpan={5}>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Audit logs will appear here
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
