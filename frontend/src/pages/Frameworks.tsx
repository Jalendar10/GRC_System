import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Bot, X, Activity } from 'lucide-react'
import Header from '../components/Header'
import ProgressBar from '../components/ui/ProgressBar'
import ScoreRing from '../components/ui/ScoreRing'
import { frameworks as frameworksApi, monitoring as monitoringApi } from '../lib/api'
import type { Framework } from '../lib/types'
import { formatCurrency, cn } from '../lib/utils'
import { useOrg } from '../contexts/OrgContext'

const COLORS: Record<string, { card: string; ring: string }> = {
  'PCI-DSS':       { card: 'from-red-900/20 to-slate-900 border-red-800/30 hover:border-red-700/50',       ring: '#f87171' },
  'SOX':           { card: 'from-blue-900/20 to-slate-900 border-blue-800/30 hover:border-blue-700/50',     ring: '#60a5fa' },
  'ISO 27001':     { card: 'from-purple-900/20 to-slate-900 border-purple-800/30 hover:border-purple-700/50', ring: '#a78bfa' },
  'NIST-CSF':      { card: 'from-cyan-900/20 to-slate-900 border-cyan-800/30 hover:border-cyan-700/50',     ring: '#34d399' },
  'FFIEC-CAT':     { card: 'from-orange-900/20 to-slate-900 border-orange-800/30 hover:border-orange-700/50', ring: '#fb923c' },
  'Basel III':     { card: 'from-emerald-900/20 to-slate-900 border-emerald-800/30 hover:border-emerald-700/50', ring: '#facc15' },
  'GDPR':          { card: 'from-indigo-900/20 to-slate-900 border-indigo-800/30 hover:border-indigo-700/50', ring: '#818cf8' },
  'CCPA-CPRA':     { card: 'from-pink-900/20 to-slate-900 border-pink-800/30 hover:border-pink-700/50',     ring: '#f472b6' },
  'HIPAA':         { card: 'from-teal-900/20 to-slate-900 border-teal-800/30 hover:border-teal-700/50',     ring: '#2dd4bf' },
  'SOC 2':         { card: 'from-violet-900/20 to-slate-900 border-violet-800/30 hover:border-violet-700/50', ring: '#8b5cf6' },
  'FedRAMP':       { card: 'from-blue-900/20 to-slate-900 border-blue-800/30 hover:border-blue-700/50',     ring: '#3b82f6' },
  'DORA':          { card: 'from-amber-900/20 to-slate-900 border-amber-800/30 hover:border-amber-700/50',  ring: '#f59e0b' },
  'NIS2':          { card: 'from-lime-900/20 to-slate-900 border-lime-800/30 hover:border-lime-700/50',     ring: '#84cc16' },
  'CMMC':          { card: 'from-sky-900/20 to-slate-900 border-sky-800/30 hover:border-sky-700/50',        ring: '#0ea5e9' },
  'NIST 800-53':   { card: 'from-cyan-900/20 to-slate-900 border-cyan-800/30 hover:border-cyan-700/50',     ring: '#06b6d4' },
  'ISO 22301':     { card: 'from-green-900/20 to-slate-900 border-green-800/30 hover:border-green-700/50',  ring: '#22c55e' },
  'CIS Controls':  { card: 'from-rose-900/20 to-slate-900 border-rose-800/30 hover:border-rose-700/50',     ring: '#fb7185' },
  'HITRUST CSF':   { card: 'from-fuchsia-900/20 to-slate-900 border-fuchsia-800/30 hover:border-fuchsia-700/50', ring: '#e879f9' },
  'COBIT 2019':    { card: 'from-slate-800/40 to-slate-900 border-slate-700/30 hover:border-slate-600/50',  ring: '#94a3b8' },
  'AML-BSA':       { card: 'from-yellow-900/20 to-slate-900 border-yellow-800/30 hover:border-yellow-700/50', ring: '#eab308' },
  'MiFID II':      { card: 'from-blue-900/20 to-slate-900 border-blue-800/30 hover:border-blue-700/50',     ring: '#1d4ed8' },
  'APRA CPS 234':  { card: 'from-emerald-900/20 to-slate-900 border-emerald-800/30 hover:border-emerald-700/50', ring: '#10b981' },
  'MAS TRM':       { card: 'from-red-900/20 to-slate-900 border-red-800/30 hover:border-red-700/50',        ring: '#dc2626' },
  'FINRA':         { card: 'from-orange-900/20 to-slate-900 border-orange-800/30 hover:border-orange-700/50', ring: '#ea580c' },
  'SAMA':          { card: 'from-green-900/20 to-slate-900 border-green-800/30 hover:border-green-700/50',  ring: '#16a34a' },
  'FISMA':         { card: 'from-purple-900/20 to-slate-900 border-purple-800/30 hover:border-purple-700/50', ring: '#7c3aed' },
  'PIPEDA':        { card: 'from-pink-900/20 to-slate-900 border-pink-800/30 hover:border-pink-700/50',     ring: '#db2777' },
  'OCC Guidelines':{ card: 'from-indigo-900/20 to-slate-900 border-indigo-800/30 hover:border-indigo-700/50', ring: '#4338ca' },
  'CCAR-DFAST':    { card: 'from-teal-900/20 to-slate-900 border-teal-800/30 hover:border-teal-700/50',     ring: '#0d9488' },
}

const ICONS: Record<string, string> = {
  'PCI-DSS': '💳', 'SOX': '🏛️', 'ISO 27001': '🔐', 'NIST-CSF': '🛡️',
  'FFIEC-CAT': '🏦', 'Basel III': '📊', 'GDPR': '🇪🇺', 'CCPA-CPRA': '🏖️',
  'HIPAA': '🏥', 'SOC 2': '✅', 'FedRAMP': '🦅', 'DORA': '⚡',
  'NIS2': '🌐', 'CMMC': '🎖️', 'NIST 800-53': '📚', 'ISO 22301': '♻️',
  'CIS Controls': '🔒', 'HITRUST CSF': '❤️', 'COBIT 2019': '⚙️', 'AML-BSA': '💰',
  'MiFID II': '📈', 'APRA CPS 234': '🦘', 'MAS TRM': '🦁', 'FINRA': '📋',
  'SAMA': '🕌', 'FISMA': '🏛️', 'PIPEDA': '🍁', 'OCC Guidelines': '🏦',
  'CCAR-DFAST': '🧪',
}

const FINE_ESTIMATES: Record<string, number> = {
  'PCI-DSS': 500_000, 'SOX': 1_000_000, 'ISO 27001': 100_000,
  'FFIEC-CAT': 750_000, 'Basel III': 2_000_000, 'NIST-CSF': 50_000,
  'GDPR': 4_000_000, 'CCPA-CPRA': 7_500, 'HIPAA': 1_900_000,
  'SOC 2': 250_000, 'FedRAMP': 500_000, 'DORA': 2_000_000,
  'NIS2': 1_000_000, 'CMMC': 500_000, 'NIST 800-53': 100_000,
  'ISO 22301': 200_000, 'CIS Controls': 50_000, 'HITRUST CSF': 300_000,
  'COBIT 2019': 100_000, 'AML-BSA': 1_500_000, 'MiFID II': 5_000_000,
  'APRA CPS 234': 1_000_000, 'MAS TRM': 1_000_000, 'FINRA': 500_000,
  'SAMA': 800_000, 'FISMA': 500_000, 'PIPEDA': 100_000, 'OCC Guidelines': 1_000_000,
  'CCAR-DFAST': 500_000,
}

const getColor = (shortName: string) =>
  COLORS[shortName] || { card: 'from-slate-800/40 to-slate-900 border-slate-700/40 hover:border-slate-600/50', ring: '#6366f1' }

export default function Frameworks() {
  const { activeOrg } = useOrg()
  const [allFrameworks, setAllFrameworks] = useState<Framework[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Framework | null>(null)
  const [fwControls, setFwControls] = useState<any>(null)
  const [loadingControls, setLoadingControls] = useState(false)
  const [gapAnalysis, setGapAnalysis] = useState<any>(null)
  const [analyzingGaps, setAnalyzingGaps] = useState(false)

  // Filter to only this org's applicable frameworks
  const frameworkList = allFrameworks.filter(f => activeOrg.frameworks.includes(f.short_name))

  const load = async () => {
    setLoading(true)
    try { setAllFrameworks(await frameworksApi.list()) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { setSelected(null); setGapAnalysis(null) }, [activeOrg.id])

  const selectFramework = async (fw: Framework) => {
    setSelected(fw)
    setFwControls(null)
    setLoadingControls(true)
    try {
      const data = await frameworksApi.getControls(fw.id)
      setFwControls(data)
    } finally { setLoadingControls(false) }
  }

  const runGapAnalysis = async () => {
    setAnalyzingGaps(true)
    try {
      const data = await monitoringApi.getGapAnalysis()
      setGapAnalysis(data)
    } finally { setAnalyzingGaps(false) }
  }

  const avg = frameworkList.length
    ? Math.round(frameworkList.reduce((s, f) => s + f.compliance_score, 0) / frameworkList.length)
    : 0

  return (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <Header
        title="Compliance Frameworks"
        subtitle={`${activeOrg.name} — ${frameworkList.length} applicable frameworks · ${activeOrg.regulator}`}
        onRefresh={load}
        loading={loading}
        actions={
          <button onClick={runGapAnalysis} disabled={analyzingGaps} className="btn-secondary text-xs">
            {analyzingGaps ? <><Bot className="w-3.5 h-3.5 animate-spin" /> Analyzing…</> : <><Bot className="w-3.5 h-3.5" /> AI Gap Analysis</>}
          </button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Overview banner */}
        <div className="card bg-gradient-to-r from-brand-900/20 to-slate-900">
          <div className="flex items-start gap-6">
            <ScoreRing score={avg} size={90} label="Avg Score" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-base font-bold text-slate-100">Multi-Framework Compliance Posture</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-medium">
                  {activeOrg.type}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-1">
                {activeOrg.name} — {frameworkList.length} applicable frameworks.{' '}
                <span className="text-emerald-400">{frameworkList.filter(f => f.compliance_status === 'compliant').length} compliant</span>,{' '}
                <span className="text-yellow-400">{frameworkList.filter(f => f.compliance_status === 'in_progress').length} in progress</span>.
              </p>
              <p className="text-xs text-slate-500 mb-3">Regulator: {activeOrg.regulator} · {activeOrg.jurisdiction}</p>

              {/* Scrollable icon row — compact chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {frameworkList.map(f => (
                  <button
                    key={f.id}
                    onClick={() => selectFramework(f)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shrink-0 transition-all hover:opacity-90',
                      selected?.id === f.id
                        ? 'bg-brand-600/20 border-brand-500/40 ring-1 ring-brand-500/30'
                        : 'bg-slate-800/60 border-slate-700/40 hover:border-slate-600',
                    )}
                  >
                    <span className="text-sm leading-none">{ICONS[f.short_name] || '📋'}</span>
                    <div className="text-left">
                      <div className="text-xs font-medium text-slate-200 whitespace-nowrap">{f.short_name}</div>
                      <div className={cn('text-xs font-bold leading-tight', f.compliance_score >= 85 ? 'text-emerald-400' : f.compliance_score >= 70 ? 'text-yellow-400' : 'text-red-400')}>
                        {f.compliance_score.toFixed(0)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gap analysis results */}
        {gapAnalysis && (
          <div className="card border-purple-600/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-purple-300">AI Gap Analysis Results</h3>
              </div>
              <div className="text-sm text-red-400 font-semibold">
                Total Fine Risk: {formatCurrency(gapAnalysis.total_gap_risk_usd)}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {gapAnalysis.framework_gaps?.map((g: any) => (
                <div key={g.framework} className={cn('p-3 rounded-xl border', g.priority === 'critical' ? 'bg-red-950/30 border-red-900/50' : g.priority === 'high' ? 'bg-orange-950/20 border-orange-900/40' : 'bg-yellow-950/10 border-yellow-900/30')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-100">{g.framework}</span>
                    <span className={cn('text-xs font-bold', g.priority === 'critical' ? 'text-red-400' : g.priority === 'high' ? 'text-orange-400' : 'text-yellow-400')}>
                      {g.compliance_score.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar value={g.compliance_score} showValue={false} size="sm" />
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>{g.gaps} gaps</span>
                    <span className="text-red-400">{formatCurrency(g.estimated_fine_risk)} risk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Framework grid + detail panel */}
        <div className="flex gap-6">
          <div className="grid grid-cols-2 gap-4 flex-1">
            {frameworkList.map(fw => (
              <button
                key={fw.id}
                onClick={() => selectFramework(fw)}
                className={cn('card bg-gradient-to-br text-left transition-all cursor-pointer', getColor(fw.short_name).card, selected?.id === fw.id ? 'ring-2 ring-brand-500/50' : '')}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{ICONS[fw.short_name] || '📋'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-100">{fw.short_name}</h3>
                      <span className="text-xs text-slate-500">v{fw.version}</span>
                      <span className={cn('badge border text-xs capitalize ml-auto',
                        fw.compliance_status === 'compliant' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                        'text-blue-400 bg-blue-400/10 border-blue-400/20'
                      )}>
                        {fw.compliance_status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{fw.description}</p>
                    <ProgressBar value={fw.compliance_score} label={`${fw.implemented_controls}/${fw.total_controls} controls`} size="sm" />
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" />{fw.implemented_controls}</span>
                      <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-orange-400" />{fw.total_controls - fw.implemented_controls} gaps</span>
                      <span className="ml-auto text-red-400/70 text-xs">
                        {formatCurrency(FINE_ESTIMATES[fw.short_name] || 0)} fine risk
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-80 animate-slide-up space-y-4">
              <div className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl mb-1">{ICONS[selected.short_name] || '📋'}</div>
                    <h3 className="text-sm font-bold text-slate-100">{selected.name}</h3>
                    <p className="text-xs text-slate-500">Version {selected.version}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><X className="w-3.5 h-3.5" /></button>
                </div>
                <ScoreRing score={selected.compliance_score} size={80} label="Compliance" />
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Total Controls</span><span className="text-slate-200 font-medium">{selected.total_controls}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Implemented</span><span className="text-emerald-400 font-medium">{selected.implemented_controls}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Gaps</span><span className="text-orange-400 font-medium">{selected.total_controls - selected.implemented_controls}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Fine Risk</span><span className="text-red-400 font-medium">{formatCurrency(FINE_ESTIMATES[selected.short_name] || 0)}</span></div>
                </div>
              </div>

              {/* Control mapping */}
              <div className="card">
                <h4 className="label mb-3">Control Mapping</h4>
                {loadingControls ? (
                  <div className="flex items-center gap-2 text-slate-400 text-xs"><Activity className="w-3.5 h-3.5 animate-spin" /> Loading…</div>
                ) : fwControls?.controls?.length ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {fwControls.controls.map((c: any, i: number) => (
                      <div key={i} className={cn('p-2.5 rounded-lg border text-xs', c.status === 'implemented' ? 'bg-emerald-950/20 border-emerald-900/40' : c.status === 'partial' ? 'bg-yellow-950/10 border-yellow-900/30' : 'bg-slate-800/60 border-slate-700')}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-brand-300 shrink-0">{c.control_ref}</span>
                          <span className={cn('badge border capitalize shrink-0', c.status === 'implemented' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : c.status === 'partial' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-slate-400 bg-slate-400/10 border-slate-400/20')}>
                            {c.status || 'not assessed'}
                          </span>
                        </div>
                        <div className="text-slate-300 mt-0.5">{c.control_name}</div>
                        {c.gap_description && <div className="text-slate-500 mt-0.5">{c.gap_description}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">No control mapping available</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
