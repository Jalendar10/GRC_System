import { useEffect, useState } from 'react'
import {
  Activity, AlertCircle, AlertTriangle, Bot, Calendar, CheckCircle2,
  Clock, DollarSign, Play, RefreshCw, Shield, Zap, TrendingUp, Bell
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Header from '../components/Header'
import ProgressBar from '../components/ui/ProgressBar'
import { monitoring as monitoringApi, audits as auditsApi } from '../lib/api'
import { severityColor, formatCurrency, cn } from '../lib/utils'

export default function Monitoring() {
  const [status, setStatus] = useState<any>(null)
  const [trajectory, setTrajectory] = useState<any[]>([])
  const [gapAnalysis, setGapAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [triggeringAudit, setTriggeringAudit] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [auditResult, setAuditResult] = useState<any>(null)
  const [runningAuditId, setRunningAuditId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [s, t, g] = await Promise.all([
        monitoringApi.getStatus(),
        monitoringApi.getTrajectory(),
        monitoringApi.getGapAnalysis(),
      ])
      setStatus(s)
      setTrajectory(t)
      setGapAnalysis(g)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const runScan = async () => {
    setScanning(true)
    try {
      const result = await monitoringApi.runScan()
      setScanResult(result)
      load()
    } finally {
      setScanning(false)
    }
  }

  const triggerQuarterlyAudit = async () => {
    setTriggeringAudit(true)
    try {
      const result = await monitoringApi.triggerQuarterlyAudit()
      setAuditResult(result)
      // Auto-run the audit if created
      if (result.audit_id && result.message !== 'Quarterly audit already exists') {
        setRunningAuditId(result.audit_id)
        await auditsApi.run(result.audit_id)
        setRunningAuditId(null)
      }
      load()
    } finally {
      setTriggeringAudit(false)
    }
  }

  const severityIcon = (sev: string) => {
    if (sev === 'critical') return <AlertCircle className="w-4 h-4 text-red-400" />
    if (sev === 'high') return <AlertTriangle className="w-4 h-4 text-orange-400" />
    return <Bell className="w-4 h-4 text-yellow-400" />
  }

  const fwColors: Record<string, string> = {
    'PCI-DSS': '#f87171', 'SOX': '#60a5fa', 'ISO 27001': '#a78bfa',
    'NIST-CSF': '#34d399', 'FFIEC-CAT': '#fb923c', 'Basel III': '#facc15',
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Activity className="w-5 h-5 animate-spin" />
          <span>Loading monitoring data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <Header
        title="Continuous Monitoring"
        subtitle="Automated compliance scanning, quarterly audits & early warning system — prevents fines before they happen"
        onRefresh={load}
        loading={loading}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-300 font-medium">Live Monitoring Active</span>
            </div>
          </div>
        }
      />

      <div className="p-8 space-y-6">

        {/* Action bar */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={runScan}
            disabled={scanning}
            className="card flex items-center gap-4 hover:border-brand-600/50 transition-all cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
              {scanning ? <Activity className="w-5 h-5 text-brand-400 animate-spin" /> : <Zap className="w-5 h-5 text-brand-400" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">{scanning ? 'Scanning…' : 'Run Compliance Scan'}</div>
              <div className="text-xs text-slate-400">Check all controls & frameworks now</div>
            </div>
          </button>

          <button
            onClick={triggerQuarterlyAudit}
            disabled={triggeringAudit}
            className="card flex items-center gap-4 hover:border-purple-600/50 transition-all cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              {triggeringAudit ? <Bot className="w-5 h-5 text-purple-400 animate-spin" /> : <Bot className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">{triggeringAudit ? 'Running AI Audit…' : 'Trigger Quarterly Audit'}</div>
              <div className="text-xs text-slate-400">Run automated AI audit right now</div>
            </div>
          </button>

          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Next Scheduled Audit</div>
              <div className="text-xs text-slate-400">
                {status?.quarterly_next ? new Date(status.quarterly_next).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Result banners */}
        {auditResult && (
          <div className={cn(
            'flex items-center gap-4 px-5 py-3 rounded-xl border text-sm',
            auditResult.message?.includes('already exists')
              ? 'bg-yellow-950/30 border-yellow-800/50 text-yellow-300'
              : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
          )}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{auditResult.message} — {auditResult.controls_in_scope || 0} controls in scope.</span>
            {runningAuditId && (
              <span className="flex items-center gap-1.5 text-purple-300 ml-2">
                <Bot className="w-3.5 h-3.5 animate-spin" /> AI engine running full audit…
              </span>
            )}
          </div>
        )}

        {scanResult && (
          <div className="flex items-center gap-4 px-5 py-3 rounded-xl border bg-blue-950/30 border-blue-800/50 text-blue-300 text-sm">
            <Zap className="w-4 h-4 shrink-0" />
            Scan complete — {scanResult.alerts_generated} alerts generated across all frameworks.
          </div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Controls Monitored', value: status?.automation_stats?.controls_monitored, color: 'text-brand-400', icon: Shield },
            { label: 'Automated Controls', value: status?.automation_stats?.automated_controls, color: 'text-purple-400', icon: Bot },
            { label: 'Critical Alerts', value: status?.alert_counts?.critical, color: 'text-red-400', icon: AlertCircle },
            { label: 'High Alerts', value: status?.alert_counts?.high, color: 'text-orange-400', icon: AlertTriangle },
            { label: 'Avg Compliance', value: `${status?.automation_stats?.avg_compliance}%`, color: 'text-emerald-400', icon: TrendingUp },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card-sm flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color} shrink-0`} />
              <div>
                <div className={`text-xl font-bold ${color}`}>{value ?? '—'}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance trajectory chart + Gap analysis */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-title">12-Week Compliance Trajectory</h2>
                <p className="text-xs text-slate-500 mt-0.5">Per-framework trend — spot declining compliance early</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(fwColors).map(([name, color]) => (
                  <div key={name} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-3 h-0.5 rounded inline-block" style={{ backgroundColor: color }} />
                    {name}
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={trajectory}>
                <defs>
                  {Object.entries(fwColors).map(([name, color]) => (
                    <linearGradient key={name} id={`g_${name.replace(/[^a-z]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => `${v.toFixed(1)}%`}
                />
                {Object.entries(fwColors).map(([name, color]) => (
                  <Area
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={color}
                    fill={`url(#g_${name.replace(/[^a-z]/gi,'')})`}
                    strokeWidth={1.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gap risk summary */}
          <div className="card">
            <h2 className="section-title mb-1">Regulatory Fine Risk</h2>
            <p className="text-xs text-slate-500 mb-4">Estimated exposure from compliance gaps</p>
            {gapAnalysis && (
              <>
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {formatCurrency(gapAnalysis.total_gap_risk_usd)}
                </div>
                <div className="text-xs text-slate-400 mb-4">Total estimated fine exposure</div>
                <div className="space-y-3">
                  {gapAnalysis.framework_gaps?.map((g: any) => (
                    <div key={g.framework}>
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className={cn('font-medium', g.priority === 'critical' ? 'text-red-400' : g.priority === 'high' ? 'text-orange-400' : 'text-yellow-400')}>
                          {g.framework}
                        </span>
                        <span className="text-slate-400">{formatCurrency(g.estimated_fine_risk)}</span>
                      </div>
                      <ProgressBar value={g.compliance_score} showValue={false} size="sm" />
                      <div className="text-xs text-slate-500 mt-0.5">{g.gaps} gap{g.gaps !== 1 ? 's' : ''} · {g.remediation_effort_weeks}w to remediate</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Alerts + Scheduled audits */}
        <div className="grid grid-cols-3 gap-6">
          {/* Live alerts */}
          <div className="col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Live Compliance Alerts</h2>
              <span className="badge bg-red-500/10 text-red-400 border border-red-500/20">
                {status?.alerts?.length || 0} active
              </span>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {status?.alerts?.length === 0 && (
                <div className="flex items-center gap-3 py-6 justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">No compliance alerts — all controls healthy</span>
                </div>
              )}
              {status?.alerts?.map((alert: any) => (
                <div key={alert.id} className={cn(
                  'p-4 rounded-xl border flex items-start gap-3',
                  alert.severity === 'critical' ? 'bg-red-950/30 border-red-900/50' :
                  alert.severity === 'high' ? 'bg-orange-950/20 border-orange-900/40' :
                  'bg-yellow-950/20 border-yellow-900/30'
                )}>
                  {severityIcon(alert.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn('badge border text-xs capitalize', severityColor(alert.severity))}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">{alert.type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-100">{alert.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{alert.detail}</div>
                  </div>
                  <button className="btn-secondary text-xs shrink-0 self-start">{alert.action}</button>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled audits */}
          <div className="card">
            <h2 className="section-title mb-4">Quarterly Schedule</h2>
            <div className="space-y-3">
              {status?.scheduled_audits?.map((s: any) => (
                <div key={s.id} className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200">{s.name}</span>
                    <span className="badge bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs shrink-0">
                      <Bot className="w-3 h-3" /> AI
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(s.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {s.frameworks.map((f: string) => (
                      <span key={f} className="text-xs px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                <span>Next auto-scan in ~1 hour</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto-evidence collection enabled</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>AI findings analysis enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Control gaps detail */}
        {gapAnalysis?.control_gaps && (
          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <h2 className="section-title mb-4">Partially Effective Controls</h2>
              {gapAnalysis.control_gaps.partially_effective?.length === 0 ? (
                <div className="text-sm text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> No partially effective controls
                </div>
              ) : (
                <div className="space-y-2">
                  {gapAnalysis.control_gaps.partially_effective?.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-yellow-950/20 border border-yellow-900/30">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">{c.name}</div>
                        <div className="text-xs text-slate-400">{c.id} · {c.owner}</div>
                      </div>
                      <div className="text-xs font-bold text-yellow-400">{(c.score * 100).toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="section-title mb-4">Ineffective Controls</h2>
              {gapAnalysis.control_gaps.ineffective?.length === 0 ? (
                <div className="text-sm text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> No ineffective controls
                </div>
              ) : (
                <div className="space-y-2">
                  {gapAnalysis.control_gaps.ineffective?.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-red-950/30 border border-red-900/40">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">{c.name}</div>
                        <div className="text-xs text-slate-400">{c.id} · {c.owner}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(c.frameworks || []).slice(0, 2).map((f: string) => (
                            <span key={f} className="text-xs text-brand-300">{f}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-red-400 shrink-0">FAILED</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
