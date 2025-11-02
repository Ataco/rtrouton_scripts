export default function UsersManagementTab() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Users Management</h2>
        <button className="btn btn-primary">Invite User</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Last Login</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t dark:border-gray-700">
              <td className="px-4 py-3" colSpan={6}>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Users will appear here
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">User Management Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>View all registered users</li>
          <li>Assign/change user roles</li>
          <li>Activate/deactivate accounts</li>
          <li>View user activity logs</li>
          <li>Reset passwords</li>
        </ul>
      </div>
    </div>
  )
}
