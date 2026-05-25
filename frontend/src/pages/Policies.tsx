import { useEffect, useState } from 'react'
import { BookOpen, CheckCircle2, Clock, Upload, Plus, Users, Bot, X, Activity, AlertCircle } from 'lucide-react'
import Header from '../components/Header'
import ProgressBar from '../components/ui/ProgressBar'
import { policies as policiesApi } from '../lib/api'
import type { Policy } from '../lib/types'
import { statusColor, formatDate, cn } from '../lib/utils'

const CATEGORIES = ['information_security', 'acceptable_use', 'data_governance', 'incident_response', 'vendor_management', 'cryptography', 'business_continuity', 'cloud_security']
const FRAMEWORK_OPTIONS = ['ISO 27001 A.5.1', 'ISO 27001 A.6.2', 'PCI-DSS 12.4', 'SOX CC6.1', 'NIST-CSF GV.PO-01', 'FFIEC', 'GDPR Art.25', 'CCPA']
const FRAMEWORK_NAMES = ['PCI-DSS', 'SOX', 'ISO 27001', 'NIST-CSF', 'FFIEC', 'Basel III']

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900">
          <h2 className="text-base font-bold text-slate-100">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const ICONS: Record<string, string> = {
  information_security: '🔒', acceptable_use: '📋', data_governance: '🗄️',
  incident_response: '🚨', vendor_management: '🤝', cryptography: '🔑',
  business_continuity: '♻️', cloud_security: '☁️',
}

export default function Policies() {
  const [policyList, setPolicyList] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [gapResults, setGapResults] = useState<Record<string, any>>({})
  const [showNewModal, setShowNewModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedGapFw, setSelectedGapFw] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    name: '', category: 'information_security', owner: 'GRC Manager Analyst',
    approver: 'CISO', description: '', scope: '', content: '',
    framework_refs: [] as string[], acknowledgment_required: true,
  })

  const load = async () => {
    setLoading(true)
    try { setPolicyList(await policiesApi.list()) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const publish = async (id: string) => {
    setPublishingId(id)
    try { await policiesApi.publish(id); load() } finally { setPublishingId(null) }
  }

  const analyzeGaps = async (id: string) => {
    const fw = selectedGapFw[id] || 'ISO 27001'
    setAnalyzingId(id)
    try {
      const result = await policiesApi.analyzeGaps(id, fw)
      setGapResults(prev => ({ ...prev, [id]: result }))
    } finally { setAnalyzingId(null) }
  }

  const savePolicy = async () => {
    setSaving(true)
    try {
      await policiesApi.create(form)
      setShowNewModal(false)
      setForm({ name: '', category: 'information_security', owner: 'GRC Manager Analyst', approver: 'CISO', description: '', scope: '', content: '', framework_refs: [], acknowledgment_required: true })
      load()
    } finally { setSaving(false) }
  }

  const avgAckRate = policyList.filter(p => p.acknowledgment_required)
    .reduce((s, p) => s + p.acknowledgment_rate, 0) /
    Math.max(1, policyList.filter(p => p.acknowledgment_required).length)

  return (
    <>
      <div className="flex-1 overflow-y-auto animate-fade-in">
        <Header
          title="Policy Hub"
          subtitle="Policy lifecycle management with AI gap analysis and automated acknowledgment tracking"
          onRefresh={load}
          loading={loading}
          actions={
            <button onClick={() => setShowNewModal(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> New Policy
            </button>
          }
        />

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Policies', value: policyList.length, color: 'text-brand-400' },
              { label: 'Published', value: policyList.filter(p => p.status === 'published').length, color: 'text-emerald-400' },
              { label: 'Pending Review', value: policyList.filter(p => ['draft', 'review'].includes(p.status)).length, color: 'text-yellow-400' },
              { label: 'Avg Acknowledgment', value: `${avgAckRate.toFixed(1)}%`, color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="card-sm flex items-center gap-3">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Policy grid */}
          <div className="grid grid-cols-2 gap-4">
            {policyList.map(policy => (
              <div key={policy.id} className="card hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{ICONS[policy.category] || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-100 truncate">{policy.name}</h3>
                      <span className="text-xs text-slate-500 shrink-0">v{policy.version}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{policy.policy_id}</span>
                      <span className={cn('badge border text-xs capitalize', statusColor(policy.status))}>{policy.status}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{policy.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1.5"><Users className="w-3 h-3" />{policy.owner}</span>
                  <span>Review: {formatDate(policy.review_date)}</span>
                </div>

                {policy.acknowledgment_required && (
                  <div className="mb-3">
                    <ProgressBar value={policy.acknowledgment_rate} label="Acknowledgment Rate" size="sm" />
                    {policy.acknowledgment_rate < 80 && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-orange-400">
                        <AlertCircle className="w-3 h-3" /> Below 80% — escalation required
                      </div>
                    )}
                  </div>
                )}

                {policy.framework_refs?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {policy.framework_refs.map(f => (
                      <span key={f} className="badge bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs">{f}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800 flex-wrap">
                  {policy.status === 'draft' && (
                    <button onClick={() => publish(policy.id)} disabled={publishingId === policy.id} className="btn-primary text-xs flex-1 justify-center">
                      {publishingId === policy.id ? <><Clock className="w-3.5 h-3.5 animate-spin" /> Publishing…</> : <><Upload className="w-3.5 h-3.5" /> Publish</>}
                    </button>
                  )}
                  {policy.status === 'published' && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Published {formatDate(policy.effective_date)}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <select
                      value={selectedGapFw[policy.id] || 'ISO 27001'}
                      onChange={e => setSelectedGapFw(prev => ({ ...prev, [policy.id]: e.target.value }))}
                      onClick={e => e.stopPropagation()}
                      className="select text-xs py-1 px-2 w-28"
                    >
                      {FRAMEWORK_NAMES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <button onClick={() => analyzeGaps(policy.id)} disabled={analyzingId === policy.id} className="btn-secondary text-xs">
                      {analyzingId === policy.id ? <><Bot className="w-3 h-3 animate-spin" /> Analyzing…</> : <><Bot className="w-3 h-3" /> AI Gap</>}
                    </button>
                  </div>
                </div>

                {gapResults[policy.id] && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-300 flex items-center gap-1"><Bot className="w-3 h-3" /> AI Gap Analysis</span>
                      <span className="text-xs text-slate-400">Coverage: {(gapResults[policy.id].coverage_score * 100).toFixed(0)}%</span>
                    </div>
                    {gapResults[policy.id].critical_gaps?.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-red-400 font-medium mb-1">Critical Gaps:</div>
                        <ul className="space-y-0.5">
                          {gapResults[policy.id].critical_gaps.slice(0, 2).map((g: string, i: number) => (
                            <li key={i} className="text-xs text-slate-400 flex items-start gap-1"><span className="text-red-400 shrink-0">•</span>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {gapResults[policy.id].quick_wins?.length > 0 && (
                      <div>
                        <div className="text-xs text-emerald-400 font-medium mb-1">Quick Wins:</div>
                        <ul className="space-y-0.5">
                          {gapResults[policy.id].quick_wins.slice(0, 2).map((w: string, i: number) => (
                            <li key={i} className="text-xs text-slate-400 flex items-start gap-1"><span className="text-emerald-400 shrink-0">→</span>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="New Policy">
        <div className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Policy Name *</label>
            <input className="input w-full" placeholder="e.g. Cloud Security Policy" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Category</label>
              <select className="select w-full" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Owner</label>
              <input className="input w-full" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Approver</label>
              <input className="input w-full" value={form.approver} onChange={e => setForm(p => ({ ...p, approver: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <input type="checkbox" id="ack" checked={form.acknowledgment_required} onChange={e => setForm(p => ({ ...p, acknowledgment_required: e.target.checked }))} className="w-4 h-4 rounded" />
              <label htmlFor="ack" className="text-xs text-slate-300 cursor-pointer">Acknowledgment Required</label>
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">Description</label>
            <textarea className="input w-full h-16 resize-none" placeholder="Policy purpose and objectives..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="label mb-1.5 block">Scope</label>
            <textarea className="input w-full h-14 resize-none" placeholder="Who and what this policy applies to..." value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value }))} />
          </div>
          <div>
            <label className="label mb-1.5 block">Framework References</label>
            <div className="flex flex-wrap gap-1.5">
              {FRAMEWORK_OPTIONS.map(f => (
                <button key={f} type="button" onClick={() => setForm(p => ({ ...p, framework_refs: p.framework_refs.includes(f) ? p.framework_refs.filter(x => x !== f) : [...p.framework_refs, f] }))}
                  className={cn('text-xs px-2 py-1 rounded-lg border transition-colors', form.framework_refs.includes(f) ? 'bg-brand-600/30 border-brand-500/50 text-brand-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600')}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button onClick={() => setShowNewModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={savePolicy} disabled={!form.name || saving} className="btn-primary text-sm">
              {saving ? <><Activity className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Create Policy'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
