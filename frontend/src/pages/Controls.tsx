import { useEffect, useState } from 'react'
import {
  Shield, Play, Plus, Filter, CheckCircle2,
  AlertCircle, Clock, Zap, Bot, ChevronDown, ChevronUp,
  Code2, X, Database, Activity
} from 'lucide-react'
import Header from '../components/Header'
import ProgressBar from '../components/ui/ProgressBar'
import { controls as controlsApi } from '../lib/api'
import type { Control } from '../lib/types'
import { statusColor, formatDate, timeAgo, cn } from '../lib/utils'

const CATEGORIES = [
  'all', 'access_control', 'encryption', 'vulnerability_management',
  'audit_logging', 'change_management', 'incident_response',
  'data_protection', 'vendor_management', 'business_continuity', 'identity_management',
]

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const FRAMEWORKS = ['PCI-DSS 8.2', 'PCI-DSS 8.4', 'SOX CC6.1', 'SOX CC6.2', 'ISO 27001 A.9.2', 'NIST-CSF PR.AC-7', 'FFIEC D1.AC.Ac.B', 'Basel III']
const INTEGRATIONS = ['okta', 'aws', 'aws_kms', 'qualys', 'splunk', 'servicenow', 'crowdstrike', 'azure', 'pagerduty', 'bitsight']

export default function Controls() {
  const [controlsList, setControlsList] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedData, setExpandedData] = useState<Record<string, any>>({})
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [showNewModal, setShowNewModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [runningAll, setRunningAll] = useState(false)
  const [allTestProgress, setAllTestProgress] = useState(0)

  const [form, setForm] = useState({
    name: '', description: '', category: 'access_control', control_type: 'preventive',
    owner: '', owner_team: '', frequency: 'quarterly', automation_level: 'manual',
    integration_source: '', is_automated: false,
    frameworks: [] as string[], tags: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (category !== 'all') params.category = category
      if (status !== 'all') params.status = status
      setControlsList(await controlsApi.list(params))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [category, status])

  const runTest = async (id: string) => {
    setTestingId(id)
    try {
      const result = await controlsApi.runTest(id)
      setTestResults(prev => ({ ...prev, [id]: result }))
      load()
    } finally { setTestingId(null) }
  }

  const runAllTests = async () => {
    setRunningAll(true)
    setAllTestProgress(0)
    const ids = controlsList.map(c => c.id)
    for (let i = 0; i < ids.length; i++) {
      setTestingId(ids[i])
      try {
        const result = await controlsApi.runTest(ids[i])
        setTestResults(prev => ({ ...prev, [ids[i]]: result }))
      } catch {}
      setAllTestProgress(Math.round(((i + 1) / ids.length) * 100))
    }
    setTestingId(null)
    setRunningAll(false)
    load()
  }

  const toggleExpand = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (!expandedData[id]) {
      const data = await controlsApi.get(id)
      setExpandedData(prev => ({ ...prev, [id]: data }))
    }
  }

  const saveControl = async () => {
    setSaving(true)
    try {
      await controlsApi.create({
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      setShowNewModal(false)
      setForm({ name: '', description: '', category: 'access_control', control_type: 'preventive', owner: '', owner_team: '', frequency: 'quarterly', automation_level: 'manual', integration_source: '', is_automated: false, frameworks: [], tags: '' })
      load()
    } finally { setSaving(false) }
  }

  const statusIcon = (s: string) => {
    if (s === 'effective') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    if (s === 'partially_effective') return <AlertCircle className="w-4 h-4 text-yellow-400" />
    if (s === 'ineffective') return <AlertCircle className="w-4 h-4 text-red-400" />
    return <Clock className="w-4 h-4 text-slate-400" />
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto animate-fade-in">
        <Header
          title="Control Registry"
          subtitle="GRC-as-Code controls with automated AI testing & continuous evidence collection"
          onRefresh={load}
          loading={loading}
          actions={
            <div className="flex items-center gap-2">
              <button onClick={runAllTests} disabled={runningAll} className="btn-secondary text-xs">
                {runningAll ? (
                  <><Activity className="w-3.5 h-3.5 animate-spin" /> Testing All… {allTestProgress}%</>
                ) : (
                  <><Zap className="w-3.5 h-3.5" /> Test All Controls</>
                )}
              </button>
              <button onClick={() => setShowNewModal(true)} className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> New Control
              </button>
            </div>
          }
        />

        <div className="p-8 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Controls', value: controlsList.length, color: 'text-brand-400' },
              { label: 'Effective', value: controlsList.filter(c => c.status === 'effective').length, color: 'text-emerald-400' },
              { label: 'Automated', value: controlsList.filter(c => c.is_automated).length, color: 'text-purple-400' },
              { label: 'Need Attention', value: controlsList.filter(c => ['ineffective', 'partially_effective'].includes(c.status)).length, color: 'text-orange-400' },
            ].map(s => (
              <div key={s.label} className="card-sm flex items-center gap-3">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          {runningAll && (
            <div className="card-sm">
              <ProgressBar value={allTestProgress} label={`Running AI test suite — ${allTestProgress}% complete`} />
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter:</span>
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="select text-sm w-52">
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="select text-sm w-44">
              {['all', 'effective', 'partially_effective', 'ineffective', 'not_tested'].map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <span className="ml-auto text-sm text-slate-400">{controlsList.length} controls</span>
          </div>

          {/* Table */}
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  {['Control', 'Category', 'Status', 'Effectiveness', 'Owner', 'Last Tested', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {controlsList.map(ctrl => (
                  <>
                    <tr key={ctrl.id} className="table-row-hover">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {statusIcon(ctrl.status)}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-medium text-slate-100">{ctrl.name}</span>
                              {ctrl.is_automated && <span className="badge text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20"><Bot className="w-3 h-3" /> Auto</span>}
                              {ctrl.code_definition && <span className="badge text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><Code2 className="w-3 h-3" /> Code</span>}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{ctrl.id} · {ctrl.frequency}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 capitalize">{ctrl.category?.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-4">
                        <span className={cn('badge border text-xs capitalize', statusColor(ctrl.status))}>
                          {ctrl.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1"><ProgressBar value={ctrl.effectiveness_score * 100} showValue={false} size="sm" /></div>
                          <span className="text-xs font-mono text-slate-300 w-8 text-right">{(ctrl.effectiveness_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-300">{ctrl.owner}</div>
                        <div className="text-xs text-slate-500">{ctrl.owner_team}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">{timeAgo(ctrl.last_tested)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => runTest(ctrl.id)} disabled={testingId === ctrl.id} className="btn-primary text-xs py-1.5 px-3">
                            {testingId === ctrl.id ? <><Bot className="w-3 h-3 animate-spin" /> Testing…</> : <><Play className="w-3 h-3" /> Test</>}
                          </button>
                          <button onClick={() => toggleExpand(ctrl.id)} className="btn-secondary text-xs py-1.5 px-3">
                            {expandedId === ctrl.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedId === ctrl.id && (
                      <tr key={`${ctrl.id}-exp`} className="bg-slate-900/40">
                        <td colSpan={7} className="px-6 py-5">
                          <div className="grid grid-cols-3 gap-6">
                            {/* Description + frameworks */}
                            <div>
                              <p className="label mb-1">Description</p>
                              <p className="text-sm text-slate-300 leading-relaxed">{ctrl.description}</p>
                              <p className="label mt-3 mb-1.5">Framework References</p>
                              <div className="flex flex-wrap gap-1.5">
                                {(ctrl.frameworks || []).map(f => (
                                  <span key={f} className="badge bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs">{f}</span>
                                ))}
                              </div>
                              <p className="label mt-3 mb-1">Integration Source</p>
                              <span className="text-sm text-slate-300 capitalize">{ctrl.integration_source || 'Manual'}</span>
                            </div>

                            {/* GRC-as-Code or evidence */}
                            <div>
                              {ctrl.code_definition ? (
                                <>
                                  <p className="label mb-1.5">GRC-as-Code Definition</p>
                                  <pre className="code-block text-xs max-h-52 overflow-auto">{ctrl.code_definition}</pre>
                                </>
                              ) : expandedData[ctrl.id]?.evidence?.length > 0 ? (
                                <>
                                  <p className="label mb-1.5">Recent Evidence</p>
                                  <div className="space-y-2">
                                    {expandedData[ctrl.id].evidence.slice(0, 3).map((e: any) => (
                                      <div key={e.id} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Database className="w-3 h-3 text-brand-400" />
                                          <span className="font-medium text-slate-200 capitalize">{e.source}</span>
                                          {e.is_automated && <span className="text-purple-400">Auto</span>}
                                        </div>
                                        <div className="text-slate-400">{e.description}</div>
                                        {e.metadata && Object.keys(e.metadata).slice(0, 2).map(k => (
                                          <div key={k} className="text-slate-500 mt-0.5">{k}: <span className="text-slate-300">{String(e.metadata[k])}</span></div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <div className="text-sm text-slate-500 italic">No evidence yet — run a test to auto-collect</div>
                              )}
                            </div>

                            {/* AI test result */}
                            <div>
                              {testResults[ctrl.id] ? (
                                <>
                                  <p className="label mb-1.5">AI Test Result</p>
                                  <div className={cn('rounded-xl p-4 border', testResults[ctrl.id].result === 'pass' ? 'bg-emerald-950/30 border-emerald-800/50' : testResults[ctrl.id].result === 'partial' ? 'bg-yellow-950/20 border-yellow-800/40' : 'bg-red-950/30 border-red-800/50')}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Bot className="w-4 h-4 text-purple-400" />
                                      <span className={cn('font-bold capitalize text-sm', testResults[ctrl.id].result === 'pass' ? 'text-emerald-400' : testResults[ctrl.id].result === 'partial' ? 'text-yellow-400' : 'text-red-400')}>
                                        {testResults[ctrl.id].result}
                                      </span>
                                      <span className="text-slate-400 text-xs ml-1">Score: {(testResults[ctrl.id].score * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="text-xs text-slate-400 mb-2">Evidence collected: {testResults[ctrl.id].evidence_collected} item(s)</div>
                                    {testResults[ctrl.id].ai_analysis?.recommendations?.length > 0 && (
                                      <ul className="space-y-1">
                                        {testResults[ctrl.id].ai_analysis.recommendations.slice(0, 3).map((r: string, i: number) => (
                                          <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5"><span className="text-brand-400 mt-0.5 shrink-0">•</span>{r}</li>
                                        ))}
                                      </ul>
                                    )}
                                    {testResults[ctrl.id].ai_analysis?.threat_relevance && (
                                      <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-500">
                                        <span className="text-slate-400 font-medium">Threat coverage: </span>
                                        {testResults[ctrl.id].ai_analysis.threat_relevance}
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
                                  <Bot className="w-8 h-8 text-slate-600" />
                                  <p className="text-sm text-slate-500 text-center">Click "Test" to run AI-powered analysis with automated evidence collection</p>
                                  <button onClick={() => runTest(ctrl.id)} disabled={testingId === ctrl.id} className="btn-primary text-xs">
                                    <Play className="w-3.5 h-3.5" /> Run AI Test
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Control Modal */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="New Control Definition">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label mb-1.5 block">Control Name *</label>
              <input className="input w-full" placeholder="e.g. Network Segmentation" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label mb-1.5 block">Description</label>
              <textarea className="input w-full h-20 resize-none" placeholder="Describe the control objective and implementation..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Category</label>
              <select className="select w-full" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Control Type</label>
              <select className="select w-full" value={form.control_type} onChange={e => setForm(p => ({ ...p, control_type: e.target.value }))}>
                {['preventive', 'detective', 'corrective', 'directive', 'compensating'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Owner</label>
              <input className="input w-full" placeholder="Name" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Team</label>
              <input className="input w-full" placeholder="Team name" value={form.owner_team} onChange={e => setForm(p => ({ ...p, owner_team: e.target.value }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Testing Frequency</label>
              <select className="select w-full" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                {['continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annual'].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Integration Source</label>
              <select className="select w-full" value={form.integration_source} onChange={e => setForm(p => ({ ...p, integration_source: e.target.value, is_automated: e.target.value !== '' }))}>
                <option value="">Manual</option>
                {INTEGRATIONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label mb-1.5 block">Framework References</label>
              <div className="flex flex-wrap gap-1.5">
                {FRAMEWORKS.map(f => (
                  <button key={f} type="button" onClick={() => setForm(p => ({ ...p, frameworks: p.frameworks.includes(f) ? p.frameworks.filter(x => x !== f) : [...p.frameworks, f] }))}
                    className={cn('text-xs px-2 py-1 rounded-lg border transition-colors', form.frameworks.includes(f) ? 'bg-brand-600/30 border-brand-500/50 text-brand-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600')}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button onClick={() => setShowNewModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={saveControl} disabled={!form.name || saving} className="btn-primary text-sm">
              {saving ? <><Activity className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Create Control'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
