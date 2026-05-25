import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const variants: Record<string, string> = {
  default: 'bg-slate-700 text-slate-300 border-slate-600',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

export default function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span className={cn('badge border', variants[variant], className)}>
      {children}
    </span>
  )
}
