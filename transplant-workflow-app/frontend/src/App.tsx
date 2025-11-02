import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { UserProvider } from './contexts/UserContext'
import { SocketProvider } from './contexts/SocketContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Loading from './components/common/Loading'

// Pages
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CasesPage from './pages/cases/CasesPage'
import CaseDetailPage from './pages/cases/CaseDetailPage'
import ReportsPage from './pages/reports/ReportsPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import AdminPage from './pages/admin/AdminPage'
import ShiftStartPage from './pages/coordinator/ShiftStartPage'

function App() {
  const { isLoading } = useAuth0()

  if (isLoading) {
    return <Loading />
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <SocketProvider>
          <Router>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/cases" element={<CasesPage />} />
                <Route path="/cases/:id" element={<CaseDetailPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/shift/start" element={<ShiftStartPage />} />
              </Route>
            </Routes>
          </Router>
        </SocketProvider>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
