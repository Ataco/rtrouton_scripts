export default function RolesManagementTab() {
  const defaultRoles = [
    { name: 'Admin', permissions: ['*'], description: 'Full system access' },
    { name: 'Surgeon', permissions: ['view:cases', 'create:surgeon-notes', 'view:reports'], description: 'Surgeon access' },
    { name: 'Coordinator', permissions: ['view:cases', 'create:cases', 'manage:workflows', 'submit:reports'], description: 'Coordinator access' },
    { name: 'User', permissions: ['view:cases', 'view:reports'], description: 'Basic user access' },
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Roles Management</h2>
        <button className="btn btn-primary">Create New Role</button>
      </div>

      <div className="space-y-4">
        {defaultRoles.map((role) => (
          <div key={role.name} className="border dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{role.name}</h3>
              <div className="space-x-2">
                <button className="btn btn-secondary btn-sm">Edit</button>
                <button className="btn btn-danger btn-sm">Delete</button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{role.description}</p>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((perm) => (
                <span key={perm} className="badge badge-info">{perm}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Available Permissions:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {[
            'view:cases', 'create:cases', 'update:cases', 'delete:cases',
            'view:reports', 'submit:reports', 'manage:workflows',
            'view:analytics', 'export:analytics', 'admin:*'
          ].map((perm) => (
            <span key={perm} className="badge badge-info">{perm}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
