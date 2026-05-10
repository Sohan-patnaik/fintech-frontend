export interface User {
  id: number
  email: string
  full_name?: string
  created_at: string
}

export interface Holding {
  ticker: string
  qty: number
  avg_price: number
  current_price?: number
  current_value?: number
  weight_pct?: number
}

export interface Portfolio {
  id: number
  name: string
  holdings: Holding[]
  created_at: string
}

export interface Transaction {
  id: number
  ticker: string
  action: 'BUY' | 'SELL'
  quantity: number
  price: number
  executed_at: string
}

export interface StockData {
  ticker: string
  price: number
  change_pct: number
  volume: number
  week_52_high: number
  week_52_low: number
  market_cap?: number
}

export interface ChatResponse {
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'INFO'
  confidence: number
  reasons: string[]
  risks: string[]
  data_sources: string[]
  timestamp?: string        // add this
  version?: string          // add this
  raw_data?: Record<string, any> | null   // add this
  market_data?: StockData
  news_data?: {
    score: number
    label: string
    summary?: string
    articles: { headline: string; url: string }[]
  }
  fundamentals_data?: {
    pe_ratio?: number
    eps?: number
    roe?: number
    quality?: string
    highlights?: string[]
    concerns?: string[]
  }
  risk_data?: {
    risk_score: number
    volatility: string
    concentration: number
    sector_exposure: Record<string, number>
    suggestions: string[]
  }
  errors: string[]
}

export interface NewsArticle {
  headline: string
  url: string
  ticker: string
  publisher?: string
}
