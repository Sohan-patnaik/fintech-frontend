'use client'
import { ChatResponse } from '@/types'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import clsx from 'clsx'

interface Props { data: ChatResponse }

const REC_CONFIG = {
  BUY:  { color: 'text-accent-green', bg: 'bg-accent-green-dim', border: 'border-accent-green-border', icon: TrendingUp, label: 'BUY' },
  SELL: { color: 'text-accent-red', bg: 'bg-accent-red-dim', border: 'border-accent-red', icon: TrendingDown, label: 'SELL' },
  HOLD: { color: 'text-accent-amber', bg: 'bg-accent-amber-dim', border: 'border-accent-amber', icon: Minus, label: 'HOLD' },
  INFO: { color: 'text-accent-blue', bg: 'bg-accent-blue-dim', border: 'border-accent-blue', icon: Minus, label: 'INFO' },
}

export default function RecommendationCard({ data }: Props) {
  const cfg = REC_CONFIG[data.recommendation] || REC_CONFIG.INFO
  const Icon = cfg.icon
  const confidencePct = Math.round(data.confidence * 100)

  return (
    <div className="card animate-fade-up space-y-5 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center border', cfg.bg, cfg.border)}>
            <Icon size={22} className={cfg.color} strokeWidth={2} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-mono uppercase tracking-widest">Recommendation</p>
            <h2 className={clsx('text-3xl font-display font-800 tracking-tight mt-0.5', cfg.color)}>
              {cfg.label}
            </h2>
          </div>
        </div>

        <div className="text-right">
          <p className="text-text-secondary text-xs font-mono uppercase tracking-widest">Confidence</p>
          <p className="text-2xl font-display font-700 text-text-primary mt-0.5">{confidencePct}%</p>
          <div className="w-24 h-1.5 bg-bg-border rounded-full mt-1.5 ml-auto">
            <div
              className={clsx('h-full rounded-full transition-all duration-700', cfg.bg.replace('bg-', 'bg-').replace('-dim', ''))}
              style={{ width: `${confidencePct}%`, background: data.recommendation === 'BUY' ? '#00D084' : data.recommendation === 'SELL' ? '#FF4D6A' : '#FFB547' }}
            />
          </div>
        </div>
      </div>

      {data.market_data && (
        <div className="flex gap-3 p-3 bg-bg-secondary rounded-lg border border-bg-border">
          <div className="flex-1 text-center">
            <p className="text-text-muted text-xs font-mono">Price</p>
            <p className="text-text-primary font-mono font-500 mt-0.5">${data.market_data.price}</p>
          </div>
          <div className="w-px bg-bg-border" />
          <div className="flex-1 text-center">
            <p className="text-text-muted text-xs font-mono">Change</p>
            <p className={clsx('font-mono font-500 mt-0.5', data.market_data.change_pct >= 0 ? 'text-accent-green' : 'text-accent-red')}>
              {data.market_data.change_pct >= 0 ? '+' : ''}{data.market_data.change_pct}%
            </p>
          </div>
          <div className="w-px bg-bg-border" />
          <div className="flex-1 text-center">
            <p className="text-text-muted text-xs font-mono">52W High</p>
            <p className="text-text-primary font-mono font-500 mt-0.5">${data.market_data.week_52_high}</p>
          </div>
          <div className="w-px bg-bg-border" />
          <div className="flex-1 text-center">
            <p className="text-text-muted text-xs font-mono">52W Low</p>
            <p className="text-text-primary font-mono font-500 mt-0.5">${data.market_data.week_52_low}</p>
          </div>
        </div>
      )}

      {data.reasons.length > 0 && (
        <div>
          <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">Why</p>
          <ul className="space-y-2">
            {data.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-primary">
                <CheckCircle size={14} className="text-accent-green mt-0.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.risks.length > 0 && (
        <div>
          <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-2">Risks</p>
          <ul className="space-y-2">
            {data.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <AlertTriangle size={14} className="text-accent-amber mt-0.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.data_sources.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1 border-t border-bg-border">
          {data.data_sources.map((s) => (
            <span key={s} className="tag tag-gray">{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}
