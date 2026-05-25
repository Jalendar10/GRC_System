import { useEffect, useState } from 'react'
import { AlertTriangle, Bot, TrendingDown, DollarSign, Target, Plus, X, Activity } from 'lucide-react'
import Header from '../components/Header'
import { risks as risksApi } from '../lib/api'
import type { Risk } from '../lib/types'
import { riskScoreToLabel, riskScoreColor, formatCurrency, formatDate, cn } from '../lib/utils'

const CATEGORIES = ['cyber', 'operational', 'financial', 'compliance', 'reputational', 'strategic']
const BUSINESS_LINES = ['Retail Banking', 'Card Services', 'Digital Banking', 'Corporate Banking', 'Investment Banking', 'All']
const RISK_EVENTS = ['internal_fraud', 'external_fraud', 'employment_practices', 'clients_products_business_practices', 'business_disruption', 'execution_delivery', 'compliance']

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
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

function ScoreSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const color = value >= 4 ? 'text-red-400' : value >= 3 ? 'text-orange-400' : value >= 2 ? 'text-yellow-400' : 'text-green-400'
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="label">{label}</label>
        <span className={cn('text-sm font-bold', color)}>{value}</span>
      </div>
      <input type="range" min={1} max={5} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700" />
      <div className="flex justify-between text-xs text-slate-600 mt-0.5">
        <span>1 Low</span><span>3 Moderate</span><span>5 Critical</span>
      </div>
    </div>
  )
}

export default function Risks() {
  const [riskList, setRiskList] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [assessingId, setAssessingId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selected, setSelected] = useState<Risk | null>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', category: 'cyber', owner: '', owner_team: '',
    inherent_likelihood: 3, inherent_impact: 3, residual_likelihood: 2, residual_impact: 2,
    risk_appetite: 'low', threat_actor: '', threat_vector: '',
    financial_impact_low: '', financial_impact_high: '',
    business_line: 'All', risk_event_type: 'external_fraud',
    framework_refs: [] as string[],
  })

  const load = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (categoryFilter !== 'all') params.category = categoryFilter
      setRiskList(await risksApi.list(params))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [categoryFilter])

  const aiAssess = async (id: string) => {
    setAssessingId(id)
    setAiResult(null)
    try {
      const result = await risksApi.aiAssess(id)
      setAiResult(result.assessment)
      load()
    } finally { setAssessingId(null) }
  }

  const saveRisk = async () => {
    setSaving(true)
    try {
      await risksApi.create({
        ...form,
        financial_impact_low: form.financial_impact_low ? Number(form.financial_impact_low) : null,
        financial_impact_high: form.financial_impact_high ? Number(form.financial_impact_high) : null,
      })
      setShowNewModal(false)
      load()
    } finally { setSaving(false) }
  }

  const scoreBox = (score: number) => {
    const color = score >= 15 ? 'bg-red-900/60 border-red-700 text-red-300'
      : score >= 10 ? 'bg-orange-900/60 border-orange-700 text-orange-300'
      : score >= 6 ? 'bg-yellow-900/60 border-yellow-700 text-yellow-300'
      : 'bg-green-900/60 border-green-700 text-green-300'
    return (
      <span className={cn('inline-flex items-center justify-center w-10 h-10 rounded-lg border font-bold text-sm shrink-0', color)}>
        {score}
      </span>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto animate-fade-in">
        <Header
          title="Risk Register"
          subtitle="Threat-informed, AI-quantified risk management with Basel III taxonomy"
          onRefresh={load}
          loading={loading}
          actions={
            <button onClick={() => setShowNewModal(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add Risk
            </button>
          }
        />

        <div className="p-8">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Risks', value: riskList.length, color: 'text-brand-400' },
              { label: 'Critical / High', value: riskList.filter(r => r.residual_score >= 10).length, color: 'text-red-400' },
              { label: 'Open', value: riskList.filter(r => r.status === 'open').length, color: 'text-orange-400' },
              { label: 'Mitigated', value: riskList.filter(r => r.status === 'mitigated').length, color: 'text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="card-sm flex items-center gap-3">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-6">
            {/* Risk list */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="select text-sm w-48">
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <span className="text-sm text-slate-400 ml-auto">{riskList.length} risks</span>
              </div>

              {riskList.map(risk => (
                <div
                  key={risk.id}
                  onClick={() => { setSelected(risk); setAiResult(null) }}
                  className={cn('card p-5 cursor-pointer transition-all hover:border-slate-600', selected?.id === risk.id ? 'border-brand-600/50 bg-brand-900/10' : '')}
                >
                  <div className="flex items-start gap-4">
                    {scoreBox(risk.residual_score)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-slate-100">{risk.title}</span>
                        <span className={cn('badge border text-xs', risk.status === 'open' ? 'text-red-400 bg-red-400/10 border-red-400/20' : risk.status === 'mitigated' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-slate-400 bg-slate-400/10 border-slate-400/20')}>
                          {risk.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{risk.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                        <span className="capitalize">{risk.category}</span>
                        <span>·</span><span>{risk.owner}</span>
                        {risk.business_line && <><span>·</span><span>{risk.business_line}</span></>}
                        {risk.financial_impact_high && (
                          <><span>·</span>
                            <span className="flex items-center gap-0.5 text-orange-400">
                              <DollarSign className="w-3 h-3" />Up to {formatCurrency(risk.financial_impact_high)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={cn('font-bold', riskScoreColor(risk.inherent_score))}>{risk.inherent_score}</span>
                        <TrendingDown className="w-3.5 h-3.5 text-slate-600" />
                        <span className={cn('font-bold', riskScoreColor(risk.residual_score))}>{risk.residual_score}</span>
                        <span className="text-slate-500">({riskScoreToLabel(risk.residual_score)})</span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(risk); aiAssess(risk.id) }}
                        disabled={assessingId === risk.id}
                        className="btn-secondary text-xs py-1"
                      >
                        {assessingId === risk.id ? <><Bot className="w-3 h-3 animate-spin" /> Assessing…</> : <><Bot className="w-3 h-3" /> AI Assess</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="w-80 space-y-4 animate-slide-up">
                <div className="card">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-100 flex-1 pr-2">{selected.title}</h3>
                    <span className="text-xs text-slate-500 shrink-0">{selected.id}</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div><p className="label mb-0.5">Inherent → Residual Score</p>
                      <div className="flex items-center gap-2">
                        <span className={cn('font-bold text-base', riskScoreColor(selected.inherent_score))}>{selected.inherent_score}</span>
                        <TrendingDown className="w-4 h-4 text-slate-500" />
                        <span className={cn('font-bold text-base', riskScoreColor(selected.residual_score))}>{selected.residual_score}</span>
                        <span className="text-slate-400">({riskScoreToLabel(selected.residual_score)})</span>
                      </div>
                    </div>
                    {selected.threat_actor && <div><p className="label mb-0.5">Threat Actor</p><p className="text-slate-300">{selected.threat_actor}</p></div>}
                    {selected.threat_vector && <div><p className="label mb-0.5">Attack Vector</p><p className="text-slate-300">{selected.threat_vector}</p></div>}
                    {selected.financial_impact_high && (
                      <div><p className="label mb-0.5">Financial Exposure</p>
                        <p>{formatCurrency(selected.financial_impact_low || 0)} – <span className="text-orange-400 font-medium">{formatCurrency(selected.financial_impact_high)}</span></p>
                      </div>
                    )}
                    {selected.framework_refs?.length > 0 && (
                      <div><p className="label mb-1">Framework Refs</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.framework_refs.map(f => <span key={f} className="badge bg-brand-500/10 text-brand-300 border border-brand-500/20">{f}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selected.treatments?.length > 0 && (
                  <div className="card">
                    <h4 className="label mb-3">Treatment Plans</h4>
                    {selected.treatments.map(t => (
                      <div key={t.id} className="flex items-start gap-2 mb-2">
                        <Target className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-200 capitalize">{t.treatment_type}</div>
                          <div className="text-xs text-slate-400">{t.description}</div>
                        </div>
                        <span className={cn('badge border text-xs capitalize shrink-0', t.status === 'completed' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-blue-400 bg-blue-400/10 border-blue-400/20')}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(assessingId === selected.id || aiResult) && (
                  <div className="card border-purple-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-semibold text-purple-300">AI Risk Assessment</h4>
                      {assessingId === selected.id && <Activity className="w-3.5 h-3.5 text-purple-400 animate-spin ml-auto" />}
                    </div>
                    {aiResult && (
                      <>
                        <p className="text-xs text-slate-300 mb-3 leading-relaxed">{aiResult.risk_narrative}</p>
                        {aiResult.key_risk_indicators?.length > 0 && (
                          <div className="mb-3">
                            <p className="label mb-1.5">Key Risk Indicators</p>
                            <ul className="space-y-1">
                              {aiResult.key_risk_indicators.slice(0, 4).map((k: string, i: number) => (
                                <li key={i} className="text-xs text-slate-400 flex items-start gap-1"><span className="text-purple-400 mt-0.5 shrink-0">•</span>{k}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {aiResult.financial_exposure_estimate && (
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            {['low', 'expected', 'high'].map(k => (
                              <div key={k} className="bg-slate-800 rounded-lg p-1.5">
                                <div className="text-xs text-slate-500 capitalize">{k}</div>
                                <div className="text-xs font-bold text-slate-200">{formatCurrency(aiResult.financial_exposure_estimate[k])}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {aiResult.treatment_recommendations?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <p className="label mb-1.5">Recommended Actions</p>
                            {aiResult.treatment_recommendations.slice(0, 2).map((r: any, i: number) => (
                              <div key={i} className="text-xs text-slate-400 mb-1 flex items-start gap-1"><span className="text-emerald-400 shrink-0 mt-0.5">→</span>{r.action}</div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Risk Modal */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Add Risk to Register">
        <div className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Risk Title *</label>
            <input className="input w-full" placeholder="e.g. Third-Party API Breach" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="label mb-1.5 block">Description</label>
            <textarea className="input w-full h-20 resize-none" placeholder="Describe the risk scenario, threat, and potential impact..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label mb-1.5 block">Category</label>
              <select className="select w-full" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Risk Appetite</label>
              <select className="select w-full" value={form.risk_appetite} onChange={e => setForm(p => ({ ...p, risk_appetite: e.target.value }))}>
                {['low', 'moderate', 'high'].map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Business Line</label>
              <select className="select w-full" value={form.business_line} onChange={e => setForm(p => ({ ...p, business_line: e.target.value }))}>
                {BUSINESS_LINES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Risk Owner</label>
              <input className="input w-full" placeholder="Name" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Basel III Event Type</label>
              <select className="select w-full" value={form.risk_event_type} onChange={e => setForm(p => ({ ...p, risk_event_type: e.target.value }))}>
                {RISK_EVENTS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ScoreSlider label="Inherent Likelihood" value={form.inherent_likelihood} onChange={v => setForm(p => ({ ...p, inherent_likelihood: v }))} />
            <ScoreSlider label="Inherent Impact" value={form.inherent_impact} onChange={v => setForm(p => ({ ...p, inherent_impact: v }))} />
            <ScoreSlider label="Residual Likelihood" value={form.residual_likelihood} onChange={v => setForm(p => ({ ...p, residual_likelihood: v }))} />
            <ScoreSlider label="Residual Impact" value={form.residual_impact} onChange={v => setForm(p => ({ ...p, residual_impact: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Financial Impact Low (USD)</label>
              <input className="input w-full" type="number" placeholder="500000" value={form.financial_impact_low} onChange={e => setForm(p => ({ ...p, financial_impact_low: e.target.value }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Financial Impact High (USD)</label>
              <input className="input w-full" type="number" placeholder="5000000" value={form.financial_impact_high} onChange={e => setForm(p => ({ ...p, financial_impact_high: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Threat Actor</label>
              <input className="input w-full" placeholder="e.g. Nation-state group" value={form.threat_actor} onChange={e => setForm(p => ({ ...p, threat_actor: e.target.value }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Threat Vector</label>
              <input className="input w-full" placeholder="e.g. Phishing, API exploit" value={form.threat_vector} onChange={e => setForm(p => ({ ...p, threat_vector: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-800">
            <div className="flex-1 p-3 rounded-lg bg-slate-800 text-center">
              <div className="text-xs text-slate-400">Inherent Score</div>
              <div className={cn('text-xl font-bold', riskScoreColor(form.inherent_likelihood * form.inherent_impact))}>{form.inherent_likelihood * form.inherent_impact}</div>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-slate-800 text-center">
              <div className="text-xs text-slate-400">Residual Score</div>
              <div className={cn('text-xl font-bold', riskScoreColor(form.residual_likelihood * form.residual_impact))}>{form.residual_likelihood * form.residual_impact}</div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setShowNewModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={saveRisk} disabled={!form.title || saving} className="btn-primary text-sm">
              {saving ? <><Activity className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Add to Register'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
