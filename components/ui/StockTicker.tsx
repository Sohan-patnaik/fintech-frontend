'use client'
import { StockData } from '@/types'
import { TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

interface Props { stock: StockData; className?: string }

export default function StockTicker({ stock, className }: Props) {
  const up = stock.change_pct >= 0
  return (
    <div className={clsx('card card-hover p-4 cursor-pointer', className)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-mono font-500 text-text-primary text-sm">{stock.ticker}</span>
          {stock.market_cap && (
            <p className="text-text-muted text-xs mt-0.5">
              ${(stock.market_cap / 1e9).toFixed(1)}B cap
            </p>
          )}
        </div>
        <span className={clsx('tag', up ? 'tag-green' : 'tag-red')}>
          {up ? '+' : ''}{stock.change_pct}%
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-display font-700 text-text-primary">${stock.price}</span>
        {up ? (
          <TrendingUp size={18} className="text-accent-green" />
        ) : (
          <TrendingDown size={18} className="text-accent-red" />
        )}
      </div>
      <div className="flex justify-between mt-2 text-xs text-text-muted font-mono">
        <span>L {stock.week_52_low}</span>
        <span>H {stock.week_52_high}</span>
      </div>
    </div>
  )
}
