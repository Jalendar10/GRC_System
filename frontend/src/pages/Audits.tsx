import { useEffect, useState } from 'react'
import {
  FileSearch, Bot, CheckCircle2, AlertCircle, Clock,
  ChevronDown, ChevronUp, Plus, Zap, X, Activity, Calendar
} from 'lucide-react'
import Header from '../components/Header'
import ProgressBar from '../components/ui/ProgressBar'
import { audits as auditsApi, monitoring as monitoringApi } from '../lib/api'
import type { Audit } from '../lib/types'
import { statusColor, severityColor, formatDate, cn } from '../lib/utils'

const FRAMEWORKS = [
  'Multi-Framework',
  // Banking & Financial
  'PCI-DSS', 'SOX', 'Basel III', 'FFIEC-CAT', 'DORA', 'AML-BSA', 'MiFID II', 'APRA CPS 234',
  'MAS TRM', 'OCC Guidelines', 'FINRA', 'SAMA', 'CCAR-DFAST',
  // Technology & Cyber
  'ISO 27001', 'NIST-CSF', 'NIST 800-53', 'SOC 2', 'SOC 1', 'FedRAMP', 'FISMA', 'CMMC',
  'CIS Controls', 'NIS2', 'HITRUST CSF', 'ISO 22301', 'COBIT 2019',
  // Privacy
  'GDPR', 'CCPA-CPRA', 'HIPAA', 'PIPEDA',
]

const AUDIT_TYPES = [
  // Internal
  { value: 'internal', label: 'Internal Audit' },
  { value: 'it_general', label: 'IT General Controls Audit' },
  { value: 'operational', label: 'Operational Audit' },
  { value: 'financial', label: 'Financial Statement Audit' },
  { value: 'performance', label: 'Performance Audit' },
  // Banking Regulatory
  { value: 'sox_404', label: 'SOX Section 404 Audit' },
  { value: 'model_risk', label: 'Model Risk Audit (SR 11-7)' },
  { value: 'capital_adequacy', label: 'Capital Adequacy Review (CCAR/DFAST)' },
  { value: 'aml_review', label: 'AML/KYC Compliance Review' },
  { value: 'bsa_review', label: 'Bank Secrecy Act (BSA) Review' },
  { value: 'liquidity_risk', label: 'Liquidity Risk Review (LCR/NSFR)' },
  { value: 'bcbs239', label: 'BCBS 239 Data Quality Audit' },
  { value: 'dora', label: 'DORA Operational Resilience Audit' },
  { value: 'finra', label: 'FINRA Compliance Examination' },
  { value: 'stress_test', label: 'Stress Testing Review' },
  // Cybersecurity
  { value: 'pci_qsa', label: 'PCI-DSS QSA Assessment' },
  { value: 'iso27001', label: 'ISO 27001 Certification Audit' },
  { value: 'soc2_t2', label: 'SOC 2 Type II Examination' },
  { value: 'soc1_t2', label: 'SOC 1 Type II Examination' },
  { value: 'fedramp', label: 'FedRAMP Authorization Review' },
  { value: 'cmmc', label: 'CMMC Assessment' },
  { value: 'nist_csf', label: 'NIST-CSF Assessment' },
  { value: 'cis_controls', label: 'CIS Controls Assessment' },
  { value: 'ffiec', label: 'FFIEC Cybersecurity Assessment' },
  { value: 'penetration_test', label: 'Penetration Testing Review' },
  { value: 'red_team', label: 'Red Team Exercise' },
  { value: 'cloud_security', label: 'Cloud Security Audit (CSA STAR)' },
  { value: 'vulnerability', label: 'Vulnerability Assessment' },
  // Privacy
  { value: 'gdpr', label: 'GDPR Data Protection Audit' },
  { value: 'hipaa', label: 'HIPAA Security/Privacy Audit' },
  { value: 'ccpa', label: 'CCPA/CPRA Compliance Review' },
  { value: 'dpia', label: 'Data Privacy Impact Assessment' },
  // Other
  { value: 'vendor', label: 'Third-Party/Vendor Audit' },
  { value: 'bcm', label: 'Business Continuity Audit' },
  { value: 'tax', label: 'Tax Compliance Audit' },
  { value: 'forensic', label: 'Forensic Audit' },
  { value: 'esg', label: 'ESG/Environmental Audit' },
  { value: 'external', label: 'External Audit' },
  { value: 'regulatory', label: 'Regulatory Examination' },
]

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Audits() {
  const [auditList, setAuditList] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [triggeringQuarterly, setTriggeringQuarterly] = useState(false)
  const [quarterlyMsg, setQuarterlyMsg] = useState('')

  const [form, setForm] = useState({
    name: '', audit_type: 'internal', framework: 'Multi-Framework',
    scope: '', auditor: 'GRC Manager Analyst', audit_lead: 'GRC Manager Analyst',
    period_start: '', period_end: '', ai_assisted: true,
  })

  const load = async () => {
    setLoading(true)
    try { setAuditList(await auditsApi.list()) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const runAudit = async (id: string) => {
    setRunningId(id)
    try { await auditsApi.run(id); load() } finally { setRunningId(null) }
  }

  const saveAndRun = async () => {
    setSaving(true)
    try {
      const created = await auditsApi.create(form)
      setShowNewModal(false)
      await load()
      // Auto-run immediately
      setRunningId(created.id)
      await auditsApi.run(created.id)
      setRunningId(null)
      load()
    } finally { setSaving(false) }
  }

  const triggerQuarterlyAudit = async () => {
    setTriggeringQuarterly(true)
    setQuarterlyMsg('')
    try {
      const result = await monitoringApi.triggerQuarterlyAudit()
      setQuarterlyMsg(result.message)
      if (result.audit_id && !result.message.includes('already exists')) {
        await load()
        setRunningId(result.audit_id)
        await auditsApi.run(result.audit_id)
        setRunningId(null)
      }
      load()
    } finally { setTriggeringQuarterly(false) }
  }

  const statusIcon = (s: string) => {
    if (s === 'completed') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    if (s === 'in_progress') return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
    if (s === 'ai_review') return <Bot className="w-4 h-4 text-purple-400 animate-spin" />
    return <Clock className="w-4 h-4 text-slate-400" />
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto animate-fade-in">
        <Header
          title="Audit Center"
          subtitle="AI-powered automated audits — runs every quarter, no manual work, prevents year-end surprises"
          onRefresh={load}
          loading={loading}
          actions={
            <div className="flex items-center gap-2">
              <button onClick={triggerQuarterlyAudit} disabled={triggeringQuarterly} className="btn-secondary text-xs">
                {triggeringQuarterly
                  ? <><Bot className="w-3.5 h-3.5 animate-spin" /> Running Q Audit…</>
                  : <><Calendar className="w-3.5 h-3.5" /> Run Quarterly Audit</>}
              </button>
              <button onClick={() => setShowNewModal(true)} className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> New Audit
              </button>
            </div>
          }
        />

        <div className="p-8 space-y-5">
          {quarterlyMsg && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-purple-950/30 border border-purple-800/50 text-purple-300 text-sm">
              <Bot className="w-4 h-4 shrink-0" /> {quarterlyMsg}
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Total', value: auditList.length, color: 'text-brand-400' },
              { label: 'Active', value: auditList.filter(a => ['in_progress','ai_review'].includes(a.status)).length, color: 'text-blue-400' },
              { label: 'Completed', value: auditList.filter(a => a.status === 'completed').length, color: 'text-emerald-400' },
              { label: 'Total Findings', value: auditList.reduce((s,a) => s + a.total_findings, 0), color: 'text-orange-400' },
              { label: 'Critical Open', value: auditList.reduce((s,a) => s + a.critical_findings, 0), color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="card-sm flex items-center gap-3">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Audit list */}
          {auditList.map(audit => (
            <div key={audit.id} className="card hover:border-slate-700 transition-colors">
              <div className="flex items-start gap-4">
                {statusIcon(audit.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-100">{audit.name}</h3>
                    <span className={cn('badge border text-xs capitalize', statusColor(audit.status))}>
                      {audit.status.replace(/_/g, ' ')}
                    </span>
                    {audit.ai_assisted && (
                      <span className="badge text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Bot className="w-3 h-3" /> AI-Assisted
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap mb-2">
                    <span>{audit.id}</span>
                    <span>·</span><span className="capitalize">{AUDIT_TYPES.find(t => t.value === audit.audit_type)?.label || audit.audit_type?.replace(/_/g, ' ')}</span>
                    {audit.framework && <><span>·</span><span>{audit.framework}</span></>}
                    {audit.auditor && <><span>·</span><span>{audit.auditor}</span></>}
                    {audit.period_start && <><span>·</span><span>{formatDate(audit.period_start)} → {formatDate(audit.period_end)}</span></>}
                  </div>

                  {audit.overall_score != null && (
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex-1 max-w-xs">
                        <ProgressBar value={audit.overall_score} label="Compliance Score" size="sm" />
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {audit.critical_findings > 0 && <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{audit.critical_findings} Critical</span>}
                        {audit.high_findings > 0 && <span className="text-orange-400">{audit.high_findings} High</span>}
                        {audit.medium_findings > 0 && <span className="text-yellow-400">{audit.medium_findings} Medium</span>}
                        {audit.low_findings > 0 && <span className="text-blue-400">{audit.low_findings} Low</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {runningId === audit.id ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                      <Bot className="w-3.5 h-3.5 animate-spin" /> AI Audit Running…
                    </div>
                  ) : (audit.status === 'planned' || audit.status === 'in_progress') ? (
                    <button onClick={() => runAudit(audit.id)} className="btn-primary text-xs">
                      <Zap className="w-3.5 h-3.5" /> Run AI Audit
                    </button>
                  ) : null}
                  {audit.findings?.length > 0 && (
                    <button onClick={() => setExpandedId(expandedId === audit.id ? null : audit.id)} className="btn-secondary text-xs">
                      {expandedId === audit.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {audit.findings.length} Findings
                    </button>
                  )}
                </div>
              </div>

              {/* AI summary */}
              {audit.ai_analysis_summary && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-start gap-2 mb-2">
                    <Bot className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-purple-300">AI Executive Summary: </span>
                      <span className="text-xs text-slate-400">{audit.ai_analysis_summary}</span>
                    </div>
                  </div>
                  {audit.ai_recommendations?.length > 0 && (
                    <div className="ml-5 flex flex-wrap gap-2 mt-1">
                      {audit.ai_recommendations.slice(0,3).map((rec,i) => (
                        <span key={i} className="text-xs bg-slate-800 text-slate-400 rounded-lg px-2.5 py-1">{rec}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Findings */}
              {expandedId === audit.id && audit.findings?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="label">Audit Findings ({audit.findings.length})</h4>
                  {audit.findings.map(f => (
                    <div key={f.id} className={cn('p-4 rounded-xl border', f.severity === 'critical' ? 'bg-red-950/30 border-red-900/50' : f.severity === 'high' ? 'bg-orange-950/20 border-orange-900/40' : f.severity === 'medium' ? 'bg-yellow-950/10 border-yellow-900/30' : 'bg-slate-800/50 border-slate-700')}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn('badge border text-xs capitalize', severityColor(f.severity))}>{f.severity}</span>
                            {f.ai_generated && <span className="text-xs text-purple-400 flex items-center gap-1"><Bot className="w-3 h-3" />AI</span>}
                          </div>
                          <h5 className="text-sm font-semibold text-slate-100 mt-1">{f.title}</h5>
                          <p className="text-xs text-slate-400 mt-1">{f.description}</p>
                          {f.root_cause && <p className="text-xs text-slate-500 mt-1"><span className="text-slate-400 font-medium">Root Cause: </span>{f.root_cause}</p>}
                          {f.recommendation && <p className="text-xs text-slate-500 mt-1"><span className="text-slate-400 font-medium">Recommendation: </span>{f.recommendation}</p>}
                        </div>
                        <div className="shrink-0 text-right space-y-1">
                          <div className={cn('badge border text-xs capitalize', f.remediation_status === 'completed' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : f.remediation_status === 'in_progress' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20')}>
                            {f.remediation_status?.replace(/_/g,' ')}
                          </div>
                          {f.remediation_due && <div className="text-xs text-slate-500">Due: {formatDate(f.remediation_due)}</div>}
                          {f.remediation_owner && <div className="text-xs text-slate-500">{f.remediation_owner}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Create New Audit">
        <div className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Audit Name *</label>
            <input className="input w-full" placeholder="e.g. PCI-DSS 4.0 Q2 Assessment" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Audit Type</label>
              <select className="select w-full" value={form.audit_type} onChange={e => setForm(p => ({ ...p, audit_type: e.target.value }))}>
                {AUDIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Framework</label>
              <select className="select w-full" value={form.framework} onChange={e => setForm(p => ({ ...p, framework: e.target.value }))}>
                {FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Period Start</label>
              <input type="date" className="input w-full" value={form.period_start} onChange={e => setForm(p => ({ ...p, period_start: e.target.value }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Period End</label>
              <input type="date" className="input w-full" value={form.period_end} onChange={e => setForm(p => ({ ...p, period_end: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">Scope</label>
            <textarea className="input w-full h-16 resize-none" placeholder="Define the audit scope..." value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value }))} />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Bot className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-purple-300">AI-Assisted Audit Enabled</div>
              <div className="text-xs text-slate-400">AI will auto-collect evidence, analyze controls, and generate findings</div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button onClick={() => setShowNewModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={saveAndRun} disabled={!form.name || saving} className="btn-primary text-sm">
              {saving ? <><Bot className="w-3.5 h-3.5 animate-spin" /> Creating & Running…</> : <><Zap className="w-3.5 h-3.5" /> Create & Run AI Audit</>}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
