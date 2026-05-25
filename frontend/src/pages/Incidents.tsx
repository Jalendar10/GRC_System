import { useEffect, useState, useCallback } from 'react'
import {
  AlertOctagon, Search, Plus, RefreshCw, ChevronLeft, ChevronRight,
  Loader2, Clock, CheckCircle2, AlertTriangle, XCircle, Flame,
  Shield, Users, Database, DollarSign, FileText
} from 'lucide-react'
import Header from '../components/Header'
import { incidents as incidentsApi } from '../lib/api'
import { cn } from '../lib/utils'
import { useToast } from '../contexts/ToastContext'
import { format, parseISO } from 'date-fns'

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high:     'text-orange-400 bg-orange-500/10 border-orange-500/30',
  medium:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  low:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
}
const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-500',
  low:      'bg-emerald-500',
}
const STATUS_COLOR: Record<string, string> = {
  open:        'text-red-400 bg-red-500/10 border-red-500/20',
  investigating:'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  contained:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
  resolved:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  closed:      'text-slate-400 bg-slate-800 border-slate-700',
}

interface Incident {
  id: string; title: string; description: string;
  incident_type: string; severity: string; status: string; category: string;
  detected_at: string | null; reported_at: string | null;
  contained_at: string | null; resolved_at: string | null;
  affected_systems: string[]; affected_users_count: number;
  data_compromised: boolean; data_types_affected: string[];
  financial_impact: number; regulatory_notification_required: boolean;
  reporter: string; assigned_to: string | null;
  root_cause: string | null; lessons_learned: string | null;
  regulatory_frameworks: string[]; created_at: string;
}

const NEW_INCIDENT: Partial<Incident> = {
  title: '', description: '', incident_type: 'operational',
  severity: 'medium', category: 'operational',
  affected_systems: [], data_compromised: false,
  data_types_affected: [], regulatory_notification_required: false,
  reporter: 'GRC Manager Analyst', financial_impact: 0, affected_users_count: 0,
}

export default function Incidents() {
  const { toast } = useToast()
  const [items, setItems] = useState<Incident[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage]   = useState(1)
  const [pages, setPages] = useState(1)
  const LIMIT = 20

  const [search, setSearch]     = useState('')
  const [severity, setSeverity] = useState('All')
  const [status, setStatus]     = useState('All')
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Incident | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]           = useState<Partial<Incident>>({ ...NEW_INCIDENT })
  const [saving, setSaving]       = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT }
      if (search)             params.search   = search
      if (severity !== 'All') params.severity  = severity
      if (status !== 'All')   params.status    = status
      const data = await incidentsApi.list(params)
      setItems(data.items || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch { toast('error', 'Failed to load incidents') }
    finally { setLoading(false) }
  }, [page, search, severity, status])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.title) { toast('error', 'Title is required'); return }
    setSaving(true)
    try {
      await incidentsApi.create(form)
      toast('success', 'Incident logged successfully')
      setShowCreate(false)
      setForm({ ...NEW_INCIDENT })
      load()
    } catch { toast('error', 'Failed to create incident') }
    finally { setSaving(false) }
  }

  const handleAnalyze = async (id: string) => {
    setAnalyzing(id)
    try {
      await incidentsApi.aiAnalyze(id)
      toast('success', 'AI analysis complete')
      load()
    } catch { toast('error', 'AI analysis failed') }
    finally { setAnalyzing(null) }
  }

  const handleStatusUpdate = async (incident: Incident, newStatus: string) => {
    try {
      await incidentsApi.update(incident.id, { status: newStatus, ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) })
      toast('success', `Status updated to ${newStatus}`)
      load()
    } catch { toast('error', 'Failed to update status') }
  }

  // Stats
  const openCount     = items.filter(i => i.status === 'open').length
  const criticalCount = items.filter(i => i.severity === 'critical').length
  const regulatoryCount = items.filter(i => i.regulatory_notification_required).length
  const totalImpact   = items.reduce((acc, i) => acc + (i.financial_impact || 0), 0)

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header title="Incident Management" subtitle="Track, respond to, and learn from security & compliance incidents" />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Incidents', value: total, icon: AlertOctagon, color: 'text-slate-400' },
            { label: 'Open', value: openCount, icon: XCircle, color: 'text-red-400' },
            { label: 'Critical', value: criticalCount, icon: Flame, color: 'text-orange-400' },
            { label: 'Regulatory Notice Req.', value: regulatoryCount, icon: FileText, color: 'text-purple-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn('w-4 h-4', stat.color)} />
                <span className="text-xs text-slate-500">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search incidents…"
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <select value={severity} onChange={e => { setSeverity(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none">
            {['All', 'critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none">
            {['All', 'open', 'investigating', 'contained', 'resolved', 'closed'].map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button onClick={load} className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Log Incident
          </button>
        </div>

        {/* Incident list */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-slate-600 bg-slate-900 border border-slate-800 rounded-xl">
              <AlertOctagon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No incidents found.</p>
            </div>
          ) : (
            items.map(incident => (
              <div key={incident.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer"
                onClick={() => setSelected(incident)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', SEVERITY_DOT[incident.severity])} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-100">{incident.title}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border', SEVERITY_COLOR[incident.severity])}>
                          {incident.severity}
                        </span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border', STATUS_COLOR[incident.status] || 'text-slate-400 bg-slate-800 border-slate-700')}>
                          {incident.status}
                        </span>
                        {incident.regulatory_notification_required && (
                          <span className="text-xs px-2 py-0.5 rounded-full border text-purple-400 bg-purple-500/10 border-purple-500/20">
                            Regulatory Notice
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <span className="text-xs text-slate-500">{incident.id}</span>
                        {incident.detected_at && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(parseISO(incident.detected_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        )}
                        {incident.affected_users_count > 0 && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {incident.affected_users_count.toLocaleString()} users
                          </span>
                        )}
                        {incident.financial_impact > 0 && (
                          <span className="text-xs text-orange-400 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${incident.financial_impact.toLocaleString()} impact
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    {incident.status === 'open' && (
                      <button
                        onClick={() => handleStatusUpdate(incident, 'investigating')}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-colors">
                        Investigate
                      </button>
                    )}
                    {incident.status === 'investigating' && (
                      <button
                        onClick={() => handleStatusUpdate(incident, 'contained')}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors">
                        Contain
                      </button>
                    )}
                    {incident.status === 'contained' && (
                      <button
                        onClick={() => handleStatusUpdate(incident, 'resolved')}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleAnalyze(incident.id)}
                      disabled={analyzing === incident.id}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-brand-600/20 border border-brand-600/30 text-brand-400 hover:bg-brand-600/30 transition-colors flex items-center gap-1 disabled:opacity-50">
                      {analyzing === incident.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                      AI Analyze
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Showing {((page-1)*LIMIT)+1}–{Math.min(page*LIMIT, total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p-1)}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-xs text-slate-400">{page} / {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(p => p+1)}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Create incident modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-100 mb-5">Log New Incident</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Title *</label>
                <input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Unauthorized access to payment systems"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Severity</label>
                  <select value={form.severity || 'medium'} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none">
                    {['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Type</label>
                  <select value={form.incident_type || 'operational'} onChange={e => setForm(f => ({ ...f, incident_type: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none">
                    {['operational', 'security', 'data_breach', 'compliance', 'fraud', 'system_outage'].map(t => (
                      <option key={t} value={t}>{t.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Description</label>
                <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Describe what happened…"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none focus:ring-2 focus:ring-brand-500/40" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Affected Users</label>
                  <input type="number" value={form.affected_users_count || 0} onChange={e => setForm(f => ({ ...f, affected_users_count: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Financial Impact ($)</label>
                  <input type="number" value={form.financial_impact || 0} onChange={e => setForm(f => ({ ...f, financial_impact: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="data-compromised" checked={form.data_compromised || false}
                  onChange={e => setForm(f => ({ ...f, data_compromised: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-800" />
                <label htmlFor="data-compromised" className="text-sm text-slate-400">Data Compromised</label>
                <input type="checkbox" id="reg-notify" checked={form.regulatory_notification_required || false}
                  onChange={e => setForm(f => ({ ...f, regulatory_notification_required: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-800 ml-4" />
                <label htmlFor="reg-notify" className="text-sm text-slate-400">Regulatory Notification Required</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-slate-100 text-sm transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Logging…' : 'Log Incident'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
