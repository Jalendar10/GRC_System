import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'
import {
  Shield, AlertTriangle, FileSearch, BookOpen,
  TrendingUp, TrendingDown, Zap, Bot, CheckCircle2,
  Clock, AlertCircle, Activity
} from 'lucide-react'
import Header from '../components/Header'
import ScoreRing from '../components/ui/ScoreRing'
import ProgressBar from '../components/ui/ProgressBar'
import Badge from '../components/ui/Badge'
import { dashboard } from '../lib/api'
import type { DashboardSummary } from '../lib/types'

const HEATMAP_COLORS: Record<string, string> = {
  '1': '#1e3a2f', '2': '#14532d', '3': '#16a34a',
  '4': '#ca8a04', '5': '#dc2626', '6': '#991b1b', '7': '#7f1d1d'
}

function heatColor(l: number, i: number) {
  const score = l * i
  if (score >= 20) return '#7f1d1d'
  if (score >= 15) return '#dc2626'
  if (score >= 10) return '#ca8a04'
  if (score >= 6) return '#16a34a'
  return '#1e3a2f'
}

const RISK_CELLS = Array.from({ length: 5 }, (_, li) =>
  Array.from({ length: 5 }, (_, ii) => ({ l: li + 1, i: ii + 1 }))
)

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [heatmap, setHeatmap] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [s, t, h] = await Promise.all([
        dashboard.getSummary(),
        dashboard.getControlTrends(),
        dashboard.getRiskHeatmap(),
      ])
      setSummary(s)
      setTrends(t)
      setHeatmap(h)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading || !summary) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Activity className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  const kpis = [
    {
      label: 'Overall Compliance Score',
      value: `${summary.overall_compliance_score}%`,
      sub: 'Across all frameworks',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      trend: '+3.2% vs last quarter',
      trendUp: true,
    },
    {
      label: 'Control Effectiveness',
      value: `${summary.control_effectiveness_rate}%`,
      sub: `${summary.controls.effective}/${summary.controls.total} controls effective`,
      icon: Shield,
      color: 'text-brand-400',
      bg: 'bg-brand-400/10',
      trend: '+1.8% vs last quarter',
      trendUp: true,
    },
    {
      label: 'Automation Rate',
      value: `${summary.automation_rate}%`,
      sub: `${summary.controls.automated} controls automated`,
      icon: Zap,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      trend: '+12% vs last quarter',
      trendUp: true,
    },
    {
      label: 'Open Critical Findings',
      value: `${summary.audits.critical_findings}`,
      sub: `${summary.audits.open_findings} total open findings`,
      icon: AlertCircle,
      color: summary.audits.critical_findings > 0 ? 'text-red-400' : 'text-emerald-400',
      bg: summary.audits.critical_findings > 0 ? 'bg-red-400/10' : 'bg-emerald-400/10',
      trend: 'Requires immediate action',
      trendUp: false,
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <Header
        title="GRC Dashboard"
        subtitle="Real-time governance, risk & compliance posture"
        onRefresh={load}
        loading={loading}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">AI Engine Active</span>
          </div>
        }
      />

      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="card hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs ${kpi.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{kpi.trend}</span>
                </div>
              </div>
              <div className={`text-3xl font-bold ${kpi.color} mb-1`}>{kpi.value}</div>
              <div className="text-sm font-medium text-slate-200">{kpi.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Row 2: Trend chart + Risk heatmap + Framework scores */}
        <div className="grid grid-cols-3 gap-6">
          {/* Compliance trend */}
          <div className="col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title">Compliance & Control Trends</h2>
                <p className="text-xs text-slate-500 mt-0.5">12-month rolling view</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-brand-400 rounded inline-block" />Compliance</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-400 rounded inline-block" />Effectiveness</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-purple-400 rounded inline-block" />Automation</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6470f3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6470f3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gEff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAuto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v: number) => `${v.toFixed(1)}%`}
                />
                <Area type="monotone" dataKey="compliance_score" stroke="#6470f3" fill="url(#gComp)" strokeWidth={2} name="Compliance" />
                <Area type="monotone" dataKey="control_effectiveness" stroke="#34d399" fill="url(#gEff)" strokeWidth={2} name="Effectiveness" />
                <Area type="monotone" dataKey="automation_rate" stroke="#a78bfa" fill="url(#gAuto)" strokeWidth={2} name="Automation" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Framework scores */}
          <div className="card">
            <h2 className="section-title mb-5">Framework Compliance</h2>
            <div className="space-y-4">
              {summary.frameworks.map((fw) => (
                <div key={fw.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-200">{fw.name}</span>
                    <span className={`text-sm font-bold ${fw.score >= 85 ? 'text-emerald-400' : fw.score >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {fw.score.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar value={fw.score} showValue={false} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Risk heatmap + Control breakdown + Score rings */}
        <div className="grid grid-cols-3 gap-6">
          {/* Risk heatmap */}
          <div className="card">
            <h2 className="section-title mb-2">Risk Heat Map</h2>
            <p className="text-xs text-slate-500 mb-4">Residual risk — likelihood × impact</p>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((l) => (
                <div key={l} className="flex items-center gap-1">
                  <span className="text-xs text-slate-600 w-4 text-right">{l}</span>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const cell = heatmap.find(h => h.likelihood === l && h.impact === i)
                    return (
                      <div
                        key={i}
                        className="flex-1 h-10 rounded flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
                        style={{ backgroundColor: heatColor(l, i) }}
                        title={cell ? `${cell.count} risk(s): ${cell.risks.map((r: any) => r.title).join(', ')}` : 'No risks'}
                      >
                        {cell && (
                          <span className="text-xs font-bold text-white">{cell.count}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
              <div className="flex items-center gap-1 mt-1">
                <span className="w-4" />
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} className="flex-1 text-center text-xs text-slate-600">{i}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <span>← Likelihood</span>
              <span>Impact →</span>
            </div>
          </div>

          {/* Control breakdown */}
          <div className="card">
            <h2 className="section-title mb-5">Control Health</h2>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={[
                { name: 'Effective', value: summary.controls.effective, color: '#34d399' },
                { name: 'Partial', value: summary.controls.partially_effective, color: '#fbbf24' },
                { name: 'Ineffective', value: summary.controls.ineffective, color: '#f87171' },
              ]} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {[summary.controls.effective, summary.controls.partially_effective, summary.controls.ineffective].map((_, i) => (
                    <Cell key={i} fill={['#34d399', '#fbbf24', '#f87171'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
              {[
                { label: 'Effective', count: summary.controls.effective, color: 'text-emerald-400' },
                { label: 'Partially Effective', count: summary.controls.partially_effective, color: 'text-yellow-400' },
                { label: 'Ineffective', count: summary.controls.ineffective, color: 'text-red-400' },
                { label: 'Automated', count: summary.controls.automated, color: 'text-purple-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score rings + quick stats */}
          <div className="card flex flex-col gap-5">
            <h2 className="section-title">Program Scores</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-2">
                <ScoreRing score={summary.overall_compliance_score} size={80} label="Compliance" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <ScoreRing score={summary.control_effectiveness_rate} size={80} label="Effectiveness" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <ScoreRing score={summary.automation_rate} size={80} label="Automation" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <ScoreRing score={summary.policies.avg_acknowledgment_rate} size={80} label="Policy Ack" />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                  High+ Risks Open
                </div>
                <span className="font-bold text-orange-400">{summary.risks.critical_high}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <FileSearch className="w-3.5 h-3.5 text-blue-400" />
                  Active Audits
                </div>
                <span className="font-bold text-blue-400">{summary.audits.active}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                  Published Policies
                </div>
                <span className="font-bold text-brand-400">{summary.policies.published}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom alert strip */}
        {summary.audits.critical_findings > 0 && (
          <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-red-950/40 border border-red-900/50">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-300">
                {summary.audits.critical_findings} Critical Audit Finding{summary.audits.critical_findings > 1 ? 's' : ''} Require Immediate Attention
              </div>
              <div className="text-xs text-red-400/70 mt-0.5">
                Navigate to Audit Center to review and assign remediation owners.
              </div>
            </div>
            <button className="btn-danger text-xs shrink-0">View Findings</button>
          </div>
        )}
      </div>
    </div>
  )
}
