import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Shield, AlertTriangle, FileSearch,
  BookOpen, Network, Code2, Activity, ChevronRight,
  Radio, Settings, ChevronDown, Check, Building2, AlertOctagon,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useOrg, ORGS, type OrgProfile } from '../contexts/OrgContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/monitoring', icon: Radio, label: 'Live Monitoring', badge: 'AUTO' },
  { to: '/controls', icon: Shield, label: 'Control Registry' },
  { to: '/risks', icon: AlertTriangle, label: 'Risk Register' },
  { to: '/audits', icon: FileSearch, label: 'Audit Center' },
  { to: '/policies', icon: BookOpen, label: 'Policies' },
  { to: '/frameworks', icon: Network, label: 'Frameworks' },
  { to: '/vendors', icon: Building2, label: 'Vendor Risk' },
  { to: '/incidents', icon: AlertOctagon, label: 'Incidents' },
  { to: '/grc-as-code', icon: Code2, label: 'GRC-as-Code' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const ORG_TYPE_COLORS: Record<string, string> = {
  'acme-bank':       'text-brand-400',
  'finserv-capital': 'text-emerald-400',
  'shield-insurance':'text-purple-400',
}

const ORG_TYPE_BG: Record<string, string> = {
  'acme-bank':       'bg-brand-500/10 border-brand-500/20',
  'finserv-capital': 'bg-emerald-500/10 border-emerald-500/20',
  'shield-insurance':'bg-purple-500/10 border-purple-500/20',
}

export default function Sidebar() {
  const { activeOrg, setActiveOrg } = useOrg()
  const [open, setOpen] = useState(false)

  const selectOrg = (org: OrgProfile) => {
    setActiveOrg(org)
    setOpen(false)
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/50">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 leading-tight">GRC Engineering</div>
            <div className="text-xs text-slate-500">Platform v1.0</div>
          </div>
        </div>
      </div>

      {/* Org switcher */}
      <div className="px-3 py-3 border-b border-slate-800 relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all',
            ORG_TYPE_BG[activeOrg.id] || 'bg-slate-800/60 border-slate-700/40',
            'hover:border-opacity-60'
          )}
        >
          <span className="text-lg leading-none">{activeOrg.icon}</span>
          <div className="flex-1 text-left min-w-0">
            <div className={cn('text-xs font-semibold truncate', ORG_TYPE_COLORS[activeOrg.id] || 'text-slate-200')}>
              {activeOrg.name}
            </div>
            <div className="text-xs text-slate-500 truncate">{activeOrg.type}</div>
          </div>
          <ChevronDown className={cn('w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform', open && 'rotate-180')} />
        </button>

        {/* Dropdown */}
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-3 right-3 top-full mt-1 z-20 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-slate-950/80 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Switch Organization</p>
              </div>
              {ORGS.map(org => (
                <button
                  key={org.id}
                  onClick={() => selectOrg(org)}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 last:border-0',
                    activeOrg.id === org.id && 'bg-slate-800/40'
                  )}
                >
                  <span className="text-xl leading-none mt-0.5">{org.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={cn('text-xs font-semibold', ORG_TYPE_COLORS[org.id] || 'text-slate-200')}>
                      {org.name}
                    </div>
                    <div className="text-xs text-slate-500">{org.type}</div>
                    <div className="text-xs text-slate-600 truncate mt-0.5">{org.regulator}</div>
                  </div>
                  {activeOrg.id === org.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">Main Menu</p>
        {navItems.map(({ to, icon: Icon, label, exact, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300')} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                    {badge}
                  </span>
                )}
                {isActive && !badge && <ChevronRight className="w-3 h-3 text-brand-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Org info + live status */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="px-2 py-1.5 rounded-lg bg-slate-800/40">
          <div className="text-xs text-slate-500">Regulator</div>
          <div className="text-xs text-slate-300 font-medium leading-tight">{activeOrg.regulator}</div>
          <div className="text-xs text-slate-600 mt-0.5">{activeOrg.jurisdiction}</div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Continuous monitoring active</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </aside>
  )
}
