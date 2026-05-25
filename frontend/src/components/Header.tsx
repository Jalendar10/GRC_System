import { useEffect, useRef, useState } from 'react'
import { Bell, User, RefreshCw, LogOut, CheckCheck, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { notifications as notifApi } from '../lib/api'
import { cn } from '../lib/utils'
import { formatDistanceToNow, parseISO } from 'date-fns'

interface HeaderProps {
  title: string
  subtitle?: string
  onRefresh?: () => void
  loading?: boolean
  actions?: React.ReactNode
}

interface Notification {
  id: string; title: string; body: string;
  notification_type: string; category: string;
  read: boolean; created_at: string;
}

const NOTIF_COLOR: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10',
  alert:    'text-orange-400 bg-orange-500/10',
  warning:  'text-yellow-400 bg-yellow-500/10',
  success:  'text-emerald-400 bg-emerald-500/10',
  info:     'text-brand-400 bg-brand-500/10',
}

export default function Header({ title, subtitle, onRefresh, loading, actions }: HeaderProps) {
  const { user, logout } = useAuth()
  const [unread, setUnread]         = useState(0)
  const [notifOpen, setNotifOpen]   = useState(false)
  const [notifs, setNotifs]         = useState<Notification[]>([])
  const [notifLoading, setNL]       = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Load unread count every 30s
  useEffect(() => {
    const loadCount = async () => {
      try {
        const d = await notifApi.unreadCount()
        setUnread(d.count || 0)
      } catch { /* ignore — backend might not be ready */ }
    }
    loadCount()
    const t = setInterval(loadCount, 30_000)
    return () => clearInterval(t)
  }, [])

  // Open panel → load notifications
  const openNotifs = async () => {
    setNotifOpen(o => !o)
    if (!notifOpen) {
      setNL(true)
      try {
        const d = await notifApi.list({ page: 1, limit: 15 })
        setNotifs(d.items || [])
        setUnread(d.unread || 0)
      } catch { }
      finally { setNL(false) }
    }
  }

  const markRead = async (id: string) => {
    await notifApi.markRead(id).catch(() => {})
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await notifApi.markAllRead().catch(() => {})
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'GR'

  return (
    <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 px-6 py-3.5">
      <div className="flex items-center gap-4">
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-100 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {actions}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
              Refresh
            </button>
          )}

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={openNotifs}
              className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-slate-950 px-0.5">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-slate-950/80 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-100">Notifications</span>
                    {unread > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono">{unread}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                        <CheckCheck className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-slate-500 hover:text-slate-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifLoading ? (
                    <div className="py-8 text-center text-slate-600 text-sm">Loading…</div>
                  ) : notifs.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">All caught up!</p>
                    </div>
                  ) : (
                    notifs.map(n => (
                      <div
                        key={n.id}
                        className={cn('flex items-start gap-3 px-4 py-3 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors cursor-default', !n.read && 'bg-brand-500/5')}
                      >
                        <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', !n.read ? 'bg-brand-400' : 'bg-slate-700')} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium leading-snug', n.read ? 'text-slate-400' : 'text-slate-100')}>{n.title}</p>
                          {n.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>}
                          <p className="text-xs text-slate-600 mt-1">
                            {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.read && (
                          <button onClick={() => markRead(n.id)} className="text-slate-600 hover:text-slate-300 shrink-0 mt-0.5" title="Mark read">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-slate-800 text-center">
                  <button className="text-xs text-slate-500 hover:text-brand-400 transition-colors flex items-center gap-1 mx-auto">
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white select-none">
              {initials}
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-medium text-slate-200 leading-tight">
                {user?.full_name || user?.email || 'GRC User'}
              </div>
              <div className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ') || 'User'}</div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="ml-1 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
