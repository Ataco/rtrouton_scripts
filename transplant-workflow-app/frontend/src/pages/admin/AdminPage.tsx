import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import AuditLogsTab from './AuditLogsTab'
import UsersManagementTab from './UsersManagementTab'
import RolesManagementTab from './RolesManagementTab'
import SystemConfigTab from './SystemConfigTab'

export default function AdminPage() {
  const { hasPermission } = useUser()

  if (!hasPermission('admin:view-audit')) {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to access the admin panel.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
        <Link
          to="/admin/audit-logs"
          className="flex-1 py-2 px-4 rounded-lg font-medium text-center hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Audit Logs
        </Link>
        <Link
          to="/admin/users"
          className="flex-1 py-2 px-4 rounded-lg font-medium text-center hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Users
        </Link>
        <Link
          to="/admin/roles"
          className="flex-1 py-2 px-4 rounded-lg font-medium text-center hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Roles
        </Link>
        <Link
          to="/admin/config"
          className="flex-1 py-2 px-4 rounded-lg font-medium text-center hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          System Config
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/admin/audit-logs" replace />} />
        <Route path="/audit-logs" element={<AuditLogsTab />} />
        <Route path="/users" element={<UsersManagementTab />} />
        <Route path="/roles" element={<RolesManagementTab />} />
        <Route path="/config" element={<SystemConfigTab />} />
      </Routes>
    </div>
  )
}
