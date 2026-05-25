import axios, { AxiosError } from 'axios'

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: '/api' })

// Attach token from storage on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('grc_access_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// Global 401 handler — redirect to login
api.interceptors.response.use(
  res => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('grc_access_token')
      localStorage.removeItem('grc_user')
      delete axios.defaults.headers.common['Authorization']
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  login:  (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  me:     () => api.get('/auth/me').then(r => r.data),
  listUsers: () => api.get('/auth/users').then(r => r.data),
  createUser: (data: any) => api.post('/auth/users', data).then(r => r.data),
  updateUser: (id: string, data: any) => api.put(`/auth/users/${id}`, data).then(r => r.data),
  deleteUser: (id: string) => api.delete(`/auth/users/${id}`).then(r => r.data),
  changePassword: (currentPw: string, newPw: string) =>
    api.post('/auth/change-password', null, { params: { current_password: currentPw, new_password: newPw } }).then(r => r.data),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboard = {
  getSummary:       () => api.get('/dashboard/summary').then(r => r.data),
  getRiskHeatmap:   () => api.get('/dashboard/risk-heatmap').then(r => r.data),
  getControlTrends: () => api.get('/dashboard/control-trends').then(r => r.data),
}

// ── Controls ──────────────────────────────────────────────────────────────────
export const controls = {
  list: (params?: Record<string, string | number>) =>
    api.get('/controls/', { params }).then(r => r.data),
  get:           (id: string)             => api.get(`/controls/${id}`).then(r => r.data),
  create:        (data: any)              => api.post('/controls/', data).then(r => r.data),
  update:        (id: string, data: any)  => api.put(`/controls/${id}`, data).then(r => r.data),
  delete:        (id: string)             => api.delete(`/controls/${id}`).then(r => r.data),
  runTest:       (id: string)             => api.post(`/controls/${id}/test`).then(r => r.data),
  collectEvidence: (id: string)           => api.post(`/controls/${id}/collect-evidence`).then(r => r.data),
}

// ── Risks ─────────────────────────────────────────────────────────────────────
export const risks = {
  list: (params?: Record<string, string | number>) =>
    api.get('/risks/', { params }).then(r => r.data),
  get:      (id: string)            => api.get(`/risks/${id}`).then(r => r.data),
  create:   (data: any)             => api.post('/risks/', data).then(r => r.data),
  update:   (id: string, data: any) => api.put(`/risks/${id}`, data).then(r => r.data),
  aiAssess: (id: string)            => api.post(`/risks/${id}/assess`).then(r => r.data),
}

// ── Audits ────────────────────────────────────────────────────────────────────
export const audits = {
  list: (params?: Record<string, string>) =>
    api.get('/audits/', { params }).then(r => r.data),
  get:           (id: string)                         => api.get(`/audits/${id}`).then(r => r.data),
  create:        (data: any)                          => api.post('/audits/', data).then(r => r.data),
  run:           (id: string)                         => api.post(`/audits/${id}/run`).then(r => r.data),
  updateFinding: (auditId: string, findingId: string, data: any) =>
    api.put(`/audits/${auditId}/findings/${findingId}`, data).then(r => r.data),
}

// ── Policies ──────────────────────────────────────────────────────────────────
export const policies = {
  list: (params?: Record<string, string>) =>
    api.get('/policies/', { params }).then(r => r.data),
  get:         (id: string)                      => api.get(`/policies/${id}`).then(r => r.data),
  create:      (data: any)                       => api.post('/policies/', data).then(r => r.data),
  update:      (id: string, data: any)           => api.put(`/policies/${id}`, data).then(r => r.data),
  publish:     (id: string)                      => api.put(`/policies/${id}/publish`).then(r => r.data),
  analyzeGaps: (id: string, framework: string)   =>
    api.post(`/policies/${id}/analyze-gaps?framework=${framework}`).then(r => r.data),
  acknowledge: (id: string, data: any)           =>
    api.post(`/policies/${id}/acknowledge`, data).then(r => r.data),
}

// ── Frameworks ────────────────────────────────────────────────────────────────
export const frameworks = {
  list:        ()          => api.get('/frameworks/').then(r => r.data),
  getControls: (id: string) => api.get(`/frameworks/${id}/controls`).then(r => r.data),
}

// ── Monitoring ────────────────────────────────────────────────────────────────
export const monitoring = {
  getStatus:              () => api.get('/monitoring/status').then(r => r.data),
  runScan:                () => api.post('/monitoring/run-scan').then(r => r.data),
  triggerQuarterlyAudit:  () => api.post('/monitoring/trigger-quarterly-audit').then(r => r.data),
  getTrajectory:          () => api.get('/monitoring/compliance-trajectory').then(r => r.data),
  getGapAnalysis:         () => api.get('/monitoring/gap-analysis').then(r => r.data),
}

// ── Settings (AI providers) ───────────────────────────────────────────────────
export const settings = {
  listProviders:    () => api.get('/settings/ai-providers').then(r => r.data),
  getActive:        () => api.get('/settings/ai-providers/active').then(r => r.data),
  getProviderModels: () => api.get('/settings/provider-models').then(r => r.data),
  testProvider:     (data: { provider: string; model: string; api_key: string; api_base_url?: string }) =>
    api.post('/settings/ai-providers/test', data).then(r => r.data),
  saveProvider:     (data: { provider: string; model: string; api_key: string; api_base_url?: string; activate: boolean }) =>
    api.post('/settings/ai-providers', data).then(r => r.data),
  activateProvider: (id: string) => api.put(`/settings/ai-providers/${id}/activate`).then(r => r.data),
  deleteProvider:   (id: string) => api.delete(`/settings/ai-providers/${id}`).then(r => r.data),
}

// ── Vendors ───────────────────────────────────────────────────────────────────
export const vendors = {
  list: (params?: Record<string, string | number>) =>
    api.get('/vendors/', { params }).then(r => r.data),
  get:      (id: string)            => api.get(`/vendors/${id}`).then(r => r.data),
  create:   (data: any)             => api.post('/vendors/', data).then(r => r.data),
  update:   (id: string, data: any) => api.put(`/vendors/${id}`, data).then(r => r.data),
  delete:   (id: string)            => api.delete(`/vendors/${id}`).then(r => r.data),
  assess:   (id: string)            => api.post(`/vendors/${id}/assess`).then(r => r.data),
}

// ── Incidents ─────────────────────────────────────────────────────────────────
export const incidents = {
  list: (params?: Record<string, string | number>) =>
    api.get('/incidents/', { params }).then(r => r.data),
  get:     (id: string)                 => api.get(`/incidents/${id}`).then(r => r.data),
  create:  (data: any)                  => api.post('/incidents/', data).then(r => r.data),
  update:  (id: string, data: any)      => api.put(`/incidents/${id}`, data).then(r => r.data),
  addTimeline: (id: string, entry: any) =>
    api.post(`/incidents/${id}/timeline`, entry).then(r => r.data),
  aiAnalyze: (id: string)              => api.post(`/incidents/${id}/ai-analyze`).then(r => r.data),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notifications = {
  list:       (params?: { page?: number; limit?: number; unread_only?: boolean }) =>
    api.get('/notifications/', { params }).then(r => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then(r => r.data),
  markRead:   (id: string)  => api.put(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: ()           => api.post('/notifications/read-all').then(r => r.data),
  delete:     (id: string)  => api.delete(`/notifications/${id}`).then(r => r.data),
}

// ── Activity Log ──────────────────────────────────────────────────────────────
export const activityLog = {
  list: (params?: Record<string, string | number>) =>
    api.get('/activity-log/', { params }).then(r => r.data),
  export: () =>
    api.get('/activity-log/export', { responseType: 'blob' }).then(r => r.data),
}

// ── Export (CSV downloads) ────────────────────────────────────────────────────
export const exportApi = {
  controls:  () => api.get('/export/controls',  { responseType: 'blob' }).then(r => r.data),
  risks:     () => api.get('/export/risks',     { responseType: 'blob' }),
  audits:    () => api.get('/export/audits',    { responseType: 'blob' }),
  vendors:   () => api.get('/export/vendors',   { responseType: 'blob' }),
}

/** Helper — trigger a CSV blob download in the browser */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default api
