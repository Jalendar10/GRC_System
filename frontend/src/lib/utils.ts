import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatScore(score: number): string {
  return `${score.toFixed(1)}%`
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function riskScoreToLabel(score: number): string {
  if (score >= 15) return 'Critical'
  if (score >= 10) return 'High'
  if (score >= 6) return 'Medium'
  return 'Low'
}

export function riskScoreColor(score: number): string {
  if (score >= 15) return 'text-red-400'
  if (score >= 10) return 'text-orange-400'
  if (score >= 6) return 'text-yellow-400'
  return 'text-green-400'
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    effective: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    partially_effective: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    ineffective: 'text-red-400 bg-red-400/10 border-red-400/20',
    not_tested: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    not_applicable: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    compliant: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    in_progress: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    planned: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    open: 'text-red-400 bg-red-400/10 border-red-400/20',
    mitigated: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    accepted: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    closed: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    published: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    draft: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    review: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    retired: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    ai_review: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  }
  return map[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
}

export function severityColor(severity: string): string {
  const map: Record<string, string> = {
    critical: 'text-red-400 bg-red-400/10 border-red-400/20',
    high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    informational: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  }
  return map[severity] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}
