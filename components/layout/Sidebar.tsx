'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  MessageSquare,
  LayoutDashboard,
  BriefcaseBusiness,
  Newspaper,
  LogOut,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'
import { useState } from 'react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/portfolio', label: 'Portfolio', icon: BriefcaseBusiness },
  { href: '/news', label: 'News', icon: Newspaper },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)

  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={clsx(
        'h-screen bg-surface/80 backdrop-blur-xl border-r border-border flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="px-4 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent-green flex items-center justify-center shadow-lg glow-green">
            <TrendingUp size={16} className="text-void" />
          </div>

          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-sm text-text-primary">
                FinCopilot
              </p>
              <p className="text-[10px] text-text-secondary font-mono">
                AI Analyst
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-secondary hover:text-text-primary"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                active
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'text-text-secondary hover:text-text-primary hover:bg-card'
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent-green rounded-r-full" />
              )}

              <Icon size={18} strokeWidth={active ? 2 : 1.5} />

              {!collapsed && <span>{label}</span>}

              {collapsed && (
                <span className="absolute left-14 bg-card text-text-primary text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-lg">
                  {label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-4 border-t border-border">
        <button
          onClick={() => {
            logout()
            router.push('/login')
          }}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-accent-red hover:bg-accent-red/10 w-full transition"
        >
          <LogOut size={18} />

          {!collapsed && <span>Sign out</span>}

          {collapsed && (
            <span className="absolute left-14 bg-card text-text-primary text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-lg">
              Sign out
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}