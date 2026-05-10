"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import StockTicker from "../../components/ui/StockTicker";
import { getStock,getPortfolios } from "@/lib/api";
import { StockData, Portfolio } from "../../types";
import {
  BriefcaseBusiness,
  MessageSquare,
  Newspaper,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { CardSkeleton } from "../../components/ui/Skeleton";

const WATCHLIST = ["AAPL", "MSFT", "GOOGL", "TSLA"];

export default function DashboardPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stockResults, portResult] = await Promise.allSettled([
          Promise.all(WATCHLIST.map((t) => getStock(t))),
          getPortfolios(),
        ]);
        if (stockResults.status === "fulfilled") setStocks(stockResults.value);
        if (portResult.status === "fulfilled") setPortfolios(portResult.value);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalValue = portfolios.reduce(
    (sum, p) =>
      sum +
      p.holdings.reduce(
        (s, h) => s + (h.current_value || h.qty * h.avg_price),
        0,
      ),
    0,
  );

  const quickActions = [
    {
      href: "/chat",
      icon: MessageSquare,
      label: "Ask AI",
      desc: "Get stock analysis",
    },
    {
      href: "/portfolio",
      icon: BriefcaseBusiness,
      label: "Portfolio",
      desc: "Track holdings",
    },
    { href: "/news", icon: Newspaper, label: "News", desc: "Market updates" },
  ];

  return (
    <div className="flex min-h-screen bg-void">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-10 animate-fade-up">
          <h1 className="font-display text-3xl font-700 tracking-tight text-text-primary">
            Dashboard
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Market overview and quick access
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-10">
          {[
            {
              label: "Portfolio Value",
              value: totalValue > 0 ? `$${totalValue.toLocaleString()}` : "—",
              sub: `${portfolios.length} portfolios`,
            },
            {
              label: "Watchlist",
              value: WATCHLIST.length.toString(),
              sub: "Tracked stocks",
            },
            {
              label: "AI Analyses",
              value: "∞",
              sub: "Available now",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="relative p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-accent-green/5 to-transparent opacity-0 hover:opacity-100 transition" />

              <p className="text-text-dim text-[11px] font-mono uppercase tracking-widest">
                {s.label}
              </p>

              <p className="text-3xl font-display font-700 text-text-primary mt-3">
                {s.value}
              </p>

              <p className="text-text-secondary text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-5 mb-10">
          {quickActions.map(({ href, icon: Icon, label, desc }, i) => (
            <Link key={href} href={href}>
              <div
                className="group relative p-5 rounded-xl bg-card border border-border hover:border-border-2 hover:bg-card-alt transition-all duration-300 flex items-center gap-4 animate-fade-up"
                style={{ animationDelay: `${i * 80 + 200}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Icon size={18} className="text-accent-green" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-500 text-sm">{label}</p>
                  <p className="text-text-dim text-xs mt-0.5">{desc}</p>
                </div>

                <ArrowRight
                  size={16}
                  className="text-text-dim group-hover:translate-x-1 transition"
                />
              </div>
            </Link>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-600 text-lg text-text-primary">
              Watchlist
            </h2>
            <span className="tag tag-gray">Live prices</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-5">
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {stocks.map((s, i) => (
                <div
                  key={s.ticker}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Link href={`/chat?q=Should I invest in ${s.ticker}?`}>
                    <div className="hover:scale-[1.01] transition-transform duration-200">
                      <StockTicker stock={s} />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
