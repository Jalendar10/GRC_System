import { useEffect, useState, useCallback } from 'react'
import {
  Building2, Search, Plus, RefreshCw, AlertTriangle, CheckCircle2,
  XCircle, Clock, ChevronLeft, ChevronRight, Download, Shield,
  ExternalLink, Loader2, Star, Globe, Database
} from 'lucide-react'
import Header from '../components/Header'
import { vendors as vendorsApi, exportApi, downloadBlob } from '../lib/api'
import { cn } from '../lib/utils'
import { useToast } from '../contexts/ToastContext'

const RISK_TIER_LABEL: Record<number, string> = {
  1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low', 5: 'Minimal'
}
const RISK_TIER_COLOR: Record<number, string> = {
  1: 'text-red-400 bg-red-500/10 border-red-500/20',
  2: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  3: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  4: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  5: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
}
const STATUS_COLOR: Record<string, string> = {
  active:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  under_review:'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  terminated:  'text-red-400 bg-red-500/10 border-red-500/20',
  onboarding:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

interface Vendor {
  id: string; name: string; vendor_type: string; category: string;
  status: string; risk_tier: number; risk_score: number | null;
  primary_contact: string | null; contact_email: string | null;
  website: string | null; country: string | null;
  services_provided: string[]; data_access: boolean; data_types: string[];
  certifications: string[]; assessment_score: number | null;
  issues_count: number; critical_issues: number;
  last_assessed: string | null; contract_value: number | null;
  created_at: string;
}

const CATEGORIES = ['All', 'technology', 'cloud', 'financial', 'legal', 'consulting', 'data', 'security']
const RISK_TIERS = ['All', '1', '2', '3', '4', '5']

export default function Vendors() {
  const { toast } = useToast()
  const [items, setItems] = useState<Vendor[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage]   = useState(1)
  const [pages, setPages] = useState(1)
  const LIMIT = 20

  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('All')
  const [riskTier, setRiskTier]   = useState('All')
  const [status, setStatus]       = useState('All')
  const [loading, setLoading]     = useState(true)
  const [assessing, setAssessing] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [selected, setSelected]   = useState<Vendor | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT }
      if (search)              params.search   = search
      if (category !== 'All') params.category  = category
      if (riskTier !== 'All') params.risk_tier = Number(riskTier)
      if (status !== 'All')   params.status    = status
      const data = await vendorsApi.list(params)
      setItems(data.items || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch {
      toast('error', 'Failed to load vendors')
    } finally { setLoading(false) }
  }, [page, search, category, riskTier, status])

  useEffect(() => { load() }, [load])

  const handleAssess = async (id: string) => {
    setAssessing(id)
    try {
      await vendorsApi.assess(id)
      toast('success', 'Vendor assessment complete')
      load()
    } catch { toast('error', 'Assessment failed') }
    finally { setAssessing(null) }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportApi.vendors()
      downloadBlob(blob as unknown as Blob, 'vendors.csv')
      toast('success', 'Vendors exported')
    } catch { toast('error', 'Export failed') }
    finally { setExporting(false) }
  }

  // Stats
  const critical = items.filter(v => v.risk_tier <= 2).length
  const active   = items.filter(v => v.status === 'active').length
  const withData = items.filter(v => v.data_access).length

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header title="Vendor Risk Management" subtitle="Third-party risk assessment & monitoring" />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Vendors', value: total, icon: Building2, color: 'text-blue-400' },
            { label: 'Active', value: active, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Critical / High Risk', value: critical, icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Data Access', value: withData, icon: Database, color: 'text-purple-400' },
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
              placeholder="Search vendors…"
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select value={riskTier} onChange={e => { setRiskTier(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none">
            {RISK_TIERS.map(t => <option key={t} value={t}>{t === 'All' ? 'All Risk Tiers' : `Tier ${t} — ${RISK_TIER_LABEL[Number(t)]}`}</option>)}
          </select>
          <button onClick={load} className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 text-sm transition-colors disabled:opacity-50">
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No vendors found. Add your first vendor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60">
                    {['Vendor', 'Category', 'Risk Tier', 'Status', 'Data Access', 'Certifications', 'Score', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {items.map(v => (
                    <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <button onClick={() => setSelected(v)} className="font-medium text-slate-100 hover:text-brand-400 transition-colors text-left">
                            {v.name}
                          </button>
                          <div className="text-xs text-slate-500">{v.id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{v.category}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium', RISK_TIER_COLOR[v.risk_tier])}>
                          <Star className="w-3 h-3" />
                          Tier {v.risk_tier} · {RISK_TIER_LABEL[v.risk_tier]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', STATUS_COLOR[v.status] || 'text-slate-400 bg-slate-800 border-slate-700')}>
                          {v.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {v.data_access
                          ? <span className="text-xs text-orange-400 font-medium">Yes ({v.data_types?.length || 0} types)</span>
                          : <span className="text-xs text-slate-600">No</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(v.certifications || []).slice(0, 3).map(c => (
                            <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">{c}</span>
                          ))}
                          {(v.certifications?.length || 0) > 3 &&
                            <span className="text-xs text-slate-600">+{v.certifications.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {v.assessment_score != null
                          ? <span className={cn('font-medium', v.assessment_score >= 75 ? 'text-emerald-400' : v.assessment_score >= 50 ? 'text-yellow-400' : 'text-red-400')}>
                              {v.assessment_score.toFixed(0)}%
                            </span>
                          : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAssess(v.id)}
                            disabled={assessing === v.id}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-brand-600/20 border border-brand-600/30 text-brand-400 hover:bg-brand-600/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {assessing === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                            Assess
                          </button>
                          {v.website && (
                            <a href={v.website} target="_blank" rel="noopener noreferrer"
                              className="text-slate-600 hover:text-slate-300 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
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
        </div>

        {/* Vendor detail panel */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelected(null)}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{selected.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selected.id} · {selected.vendor_type}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-xl leading-none">&times;</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Category', value: selected.category },
                  { label: 'Country', value: selected.country || '—' },
                  { label: 'Risk Tier', value: `Tier ${selected.risk_tier} — ${RISK_TIER_LABEL[selected.risk_tier]}` },
                  { label: 'Status', value: selected.status?.replace('_', ' ') },
                  { label: 'Assessment Score', value: selected.assessment_score ? `${selected.assessment_score}%` : '—' },
                  { label: 'Contract Value', value: selected.contract_value ? `$${selected.contract_value.toLocaleString()}` : '—' },
                  { label: 'Data Access', value: selected.data_access ? `Yes — ${selected.data_types?.join(', ')}` : 'No' },
                  { label: 'Contact', value: selected.contact_email || selected.primary_contact || '—' },
                ].map(row => (
                  <div key={row.label} className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-0.5">{row.label}</div>
                    <div className="text-slate-200 font-medium capitalize truncate">{row.value}</div>
                  </div>
                ))}
              </div>
              {selected.certifications?.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-slate-500 mb-2">Certifications</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.certifications.map(c => (
                      <span key={c} className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
