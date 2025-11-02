import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  syncUser: (data: any) => api.post('/auth/sync-user', data),
  getMe: () => api.get('/auth/me'),
}

// Cases API
export const casesAPI = {
  getAll: (params?: any) => api.get('/cases', { params }),
  getById: (id: string) => api.get(`/cases/${id}`),
  create: (data: any) => api.post('/cases', data),
  update: (id: string, data: any) => api.patch(`/cases/${id}`, data),
  getUnclaimedForShift: () => api.get('/cases/shift/unclaimed'),
}

// Organ Matches API
export const organMatchesAPI = {
  create: (data: any) => api.post('/organ-matches', data),
  update: (id: string, data: any) => api.patch(`/organ-matches/${id}`, data),
  assignCoordinator: (id: string, coordinatorId: string) =>
    api.post(`/organ-matches/${id}/assign`, { coordinatorId }),
  getMyAssignments: () => api.get('/organ-matches/my-assignments'),
}

// Reporting API
export const reportingAPI = {
  submit: (data: any) => api.post('/reporting', data),
  getByOrganMatch: (organMatchId: string) =>
    api.get(`/reporting/organ-match/${organMatchId}`),
  getByType: (formType: string, params?: any) =>
    api.get(`/reporting/type/${formType}`, { params }),
  getById: (id: string) => api.get(`/reporting/${id}`),
}

// Chat API
export const chatAPI = {
  sendMessage: (data: any) => api.post('/chat/messages', data),
  getMessages: (donorCaseId: string, params?: any) =>
    api.get(`/chat/${donorCaseId}/messages`, { params }),
  uploadFile: (formData: FormData) =>
    api.post('/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// Transport API
export const transportAPI = {
  create: (data: any) => api.post('/transport', data),
  update: (id: string, data: any) => api.patch(`/transport/${id}`, data),
  track: (id: string) => api.get(`/transport/${id}/track`),
  getByOrganMatch: (organMatchId: string) =>
    api.get(`/transport/organ-match/${organMatchId}`),
}

// Preservation API
export const preservationAPI = {
  startSegment: (data: any) => api.post('/preservation/segments', data),
  endSegment: (id: string) => api.patch(`/preservation/segments/${id}/end`),
  getByOrganMatch: (organMatchId: string) =>
    api.get(`/preservation/organ-match/${organMatchId}`),
  getTolerances: () => api.get('/preservation/tolerances'),
  updateTolerance: (id: string, data: any) =>
    api.patch(`/preservation/tolerances/${id}`, data),
  createTolerance: (data: any) => api.post('/preservation/tolerances', data),
  getRemainingTime: (organMatchId: string) =>
    api.get(`/preservation/remaining-time/${organMatchId}`),
}

// Surgeon Notes API
export const surgeonNotesAPI = {
  create: (data: any) => api.post('/surgeon-notes', data),
  update: (id: string, data: any) => api.patch(`/surgeon-notes/${id}`, data),
  getByOrganMatch: (organMatchId: string) =>
    api.get(`/surgeon-notes/organ-match/${organMatchId}`),
  getAll: (params?: any) => api.get('/surgeon-notes/all', { params }),
}

// Workflows API
export const workflowsAPI = {
  createTemplate: (data: any) => api.post('/workflows/templates', data),
  getTemplates: (params?: any) => api.get('/workflows/templates', { params }),
  updateTemplate: (id: string, data: any) =>
    api.patch(`/workflows/templates/${id}`, data),
  createProgress: (data: any) => api.post('/workflows/progress', data),
  updateProgress: (id: string, data: any) =>
    api.patch(`/workflows/progress/${id}`, data),
  getProgressByOrganMatch: (organMatchId: string) =>
    api.get(`/workflows/progress/organ-match/${organMatchId}`),
}

// Analytics API
export const analyticsAPI = {
  getByOrganMatch: (organMatchId: string) =>
    api.get(`/analytics/organ-match/${organMatchId}`),
  calculate: (organMatchId: string) =>
    api.post(`/analytics/organ-match/${organMatchId}/calculate`),
  getAggregate: (params?: any) => api.get('/analytics/aggregate', { params }),
  export: (params?: any) =>
    api.get('/analytics/export', { params, responseType: 'blob' }),
}

// Admin API
export const adminAPI = {
  getAuditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId: string, roleId: string) =>
    api.patch(`/admin/users/${userId}/role`, { roleId }),
  deactivateUser: (userId: string) =>
    api.patch(`/admin/users/${userId}/deactivate`),
  reassignCase: (organMatchId: string, newCoordinatorId: string) =>
    api.post('/admin/reassign-case', { organMatchId, newCoordinatorId }),
  getConfig: (params?: any) => api.get('/admin/config', { params }),
  updateConfig: (key: string, data: any) =>
    api.patch(`/admin/config/${key}`, data),
}

// Donor Summary API
export const donorSummaryAPI = {
  upload: (formData: FormData) =>
    api.post('/donor-summary/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getByCase: (donorCaseId: string) =>
    api.get(`/donor-summary/case/${donorCaseId}`),
  getById: (id: string) => api.get(`/donor-summary/${id}`),
}

// Users API
export const usersAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
}

// Roles API
export const rolesAPI = {
  getAll: () => api.get('/roles'),
  create: (data: any) => api.post('/roles', data),
  update: (id: string, data: any) => api.patch(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
}

// Phase 2: Risk Prediction API
export const riskPredictionAPI = {
  predictSuccess: (organMatchId: string) =>
    api.get(`/risk-prediction/organ-match/${organMatchId}`),
  recommendPreservation: (data: any) =>
    api.post('/risk-prediction/recommend-preservation', data),
  batchPredict: (organMatchIds: string[]) =>
    api.post('/risk-prediction/batch-predict', { organMatchIds }),
}

// Phase 2: Report Generation API
export const reportGenerationAPI = {
  generateCaseReport: (donorCaseId: string) =>
    api.get(`/report-generation/case/${donorCaseId}`),
  generateOrganReport: (organMatchId: string) =>
    api.get(`/report-generation/organ/${organMatchId}`),
  generateDailySummary: (date?: string) =>
    api.get('/report-generation/daily-summary', { params: { date } }),
  generateAnalyticsReport: (params?: any) =>
    api.get('/report-generation/analytics-report', { params }),
}

// Phase 2: Notifications API
export const notificationsAPI = {
  send: (data: any) => api.post('/notifications/send', data),
  sendBatch: (notifications: any[]) =>
    api.post('/notifications/send-batch', { notifications }),
  getMyNotifications: () => api.get('/notifications/my-notifications'),
}
