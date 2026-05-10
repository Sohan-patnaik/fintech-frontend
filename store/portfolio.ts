import { create } from 'zustand'
import { Portfolio } from '@/types'

interface PortfolioState {
  portfolios: Portfolio[]
  activePortfolio: Portfolio | null
  setPortfolios: (p: Portfolio[]) => void
  setActivePortfolio: (p: Portfolio | null) => void
  addPortfolio: (p: Portfolio) => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolios: [],
  activePortfolio: null,
  setPortfolios: (portfolios) => set({ portfolios }),
  setActivePortfolio: (activePortfolio) => set({ activePortfolio }),
  addPortfolio: (p) => set((s) => ({ portfolios: [...s.portfolios, p] })),
}))
