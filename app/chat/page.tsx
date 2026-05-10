"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { sendChat } from "../api/route";
import { ChatResponse } from "@/types";
import {
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Newspaper,
  BarChart2,
  Shield,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
} from "lucide-react";
import clsx from "clsx";

// ── Suggestion prompts ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: "Should I invest in AAPL?", icon: TrendingUp },
  { label: "Analyze TSLA stock", icon: BarChart2 },
  { label: "Is MSFT a good buy right now?", icon: Zap },
  { label: "What is the risk of investing in GOOGL?", icon: Shield },
];

// ── Types ───────────────────────────────────────────────────────────────────
interface Article {
  headline: string;
  url: string;
}
interface NewsData {
  label: "bullish" | "bearish" | "neutral";
  sentiment_score?: number;
  articles: Article[];
}
interface FundamentalsData {
  pe_ratio?: number;
  eps?: number;
  roe?: number;
  quality?: string;
}
interface MarketData {
  price?: number;
  change_pct?: number;
  volume?: number;
  market_cap?: number;
  ticker?: string;
}

interface RawData {
  news_data?: NewsData;
  fundamentals_data?: FundamentalsData;
  market_data?: MarketData;
}

interface TypedChatResponse extends ChatResponse {
  raw_data?: RawData;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  data?: TypedChatResponse;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const REC_CONFIG = {
  buy: {
    label: "BUY",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/30",
    Icon: TrendingUp,
  },
  sell: {
    label: "SELL",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
    Icon: TrendingDown,
  },
  hold: {
    label: "HOLD",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/30",
    Icon: Minus,
  },
};

function fmt(n?: number, decimals = 2) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}
function fmtPct(n?: number) {
  return n == null ? "—" : `${(n * 100).toFixed(1)}%`;
}
function fmtLargeNum(n?: number) {
  if (n == null) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 70 ? "bg-emerald-400" : pct >= 45 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-700",
            color,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-text-muted w-8 text-right">
        {pct}%
      </span>
    </div>
  );
}

function MarketCard({ data }: { data: MarketData }) {
  const up = (data.change_pct ?? 0) >= 0;
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={13} className="text-text-muted" />
        <span className="text-text-secondary text-xs font-mono uppercase tracking-widest">
          Market Data {data.ticker ? `· ${data.ticker}` : ""}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          {
            label: "Price",
            value: data.price != null ? `$${fmt(data.price)}` : "—",
          },
          {
            label: "Change",
            value:
              data.change_pct != null
                ? `${up ? "+" : ""}${data.change_pct.toFixed(2)}%`
                : "—",
            accent:
              data.change_pct != null
                ? up
                  ? "text-emerald-400"
                  : "text-red-400"
                : "",
          },
          { label: "Volume", value: fmtLargeNum(data.volume) },
          { label: "Market Cap", value: fmtLargeNum(data.market_cap) },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="bg-bg-secondary rounded-lg p-2.5 text-center"
          >
            <p className="text-text-muted text-xs font-mono">{label}</p>
            <p
              className={clsx(
                "font-mono font-500 text-sm mt-0.5",
                accent || "text-text-primary",
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsCard({ data }: { data: NewsData }) {
  const sentimentColor =
    data.label === "bullish"
      ? "tag-green"
      : data.label === "bearish"
        ? "tag-red"
        : "tag-gray";
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper size={13} className="text-text-muted" />
        <span className="text-text-secondary text-xs font-mono uppercase tracking-widest">
          News Sentiment
        </span>
        <span className={clsx("tag ml-auto capitalize", sentimentColor)}>
          {data.label}
        </span>
        {data.sentiment_score != null && (
          <span className="text-text-muted text-xs font-mono">
            {data.sentiment_score.toFixed(2)}
          </span>
        )}
      </div>
      {data.articles.length > 0 ? (
        <ul className="space-y-2">
          {data.articles.slice(0, 4).map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-text-muted font-mono text-xs mt-0.5 shrink-0">
                {i + 1}.
              </span>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-text-secondary hover:text-accent-green transition-colors line-clamp-1"
              >
                {a.headline}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-muted text-xs">No articles available.</p>
      )}
    </div>
  );
}

function FundamentalsCard({ data }: { data: FundamentalsData }) {
  const qualityColor =
    data.quality === "excellent" || data.quality === "good"
      ? "tag-green"
      : data.quality === "fair"
        ? "tag-amber"
        : "tag-red";

  const metrics = [
    {
      label: "P/E Ratio",
      value: data.pe_ratio != null ? fmt(data.pe_ratio, 1) : null,
    },
    { label: "EPS", value: data.eps != null ? `$${fmt(data.eps, 2)}` : null },
    { label: "ROE", value: data.roe != null ? fmtPct(data.roe) : null },
  ].filter((m) => m.value);

  if (!metrics.length && !data.quality) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={13} className="text-text-muted" />
        <span className="text-text-secondary text-xs font-mono uppercase tracking-widest">
          Fundamentals
        </span>
        {data.quality && (
          <span className={clsx("tag ml-auto capitalize", qualityColor)}>
            {data.quality}
          </span>
        )}
      </div>
      {metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {metrics.map(({ label, value }) => (
            <div
              key={label}
              className="bg-bg-secondary rounded-lg p-2.5 text-center"
            >
              <p className="text-text-muted text-xs font-mono">{label}</p>
              <p className="text-text-primary font-mono font-500 text-sm mt-0.5">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssistantCard({ data }: { data: TypedChatResponse }) {
  const rec = (
    data.recommendation as string
  )?.toLowerCase() as keyof typeof REC_CONFIG;
  const config = REC_CONFIG[rec] ?? REC_CONFIG.hold;
  const { Icon } = config;

  const raw = data.raw_data ?? {};
  const marketData = raw.market_data;
  const newsData = raw.news_data;
  const fundamentals = raw.fundamentals_data;

  return (
    <div className="max-w-2xl w-full space-y-3 animate-fade-up">
      {/* ── Main decision card ── */}
      <div className="card p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
                config.bg,
              )}
            >
              <Icon size={18} className={config.color} />
            </div>
            <div>
              <p className="text-text-muted text-xs font-mono uppercase tracking-widest">
                Recommendation
              </p>
              <p
                className={clsx(
                  "text-xl font-display font-700 leading-none mt-0.5",
                  config.color,
                )}
              >
                {config.label}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-text-muted text-xs font-mono uppercase tracking-widest mb-1">
              Confidence
            </p>
            <div className="w-32">
              <ConfidenceBar value={data.confidence} />
            </div>
          </div>
        </div>

        {/* Reasons */}
        {data.reasons?.length > 0 && (
          <div className="mb-4">
            <p className="text-text-muted text-xs font-mono uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={11} /> Why
            </p>
            <ul className="space-y-1.5">
              {data.reasons.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <span className="text-accent-green mt-0.5 shrink-0">›</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {data.risks?.length > 0 && (
          <div className="mb-4">
            <p className="text-text-muted text-xs font-mono uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <AlertTriangle size={11} /> Risks
            </p>
            <ul className="space-y-1.5">
              {data.risks.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <span className="text-amber-400 mt-0.5 shrink-0">›</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer: data sources + timestamp */}
        <div className="flex items-center gap-3 pt-3 border-t border-bg-border flex-wrap">
          <Database size={11} className="text-text-muted shrink-0" />
          <div className="flex flex-wrap gap-1.5 flex-1">
            {data.data_sources?.map((s) => (
              <span key={s} className="tag tag-gray text-xs capitalize">
                {s.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          {data.timestamp && (
            <span className="text-text-muted text-xs font-mono flex items-center gap-1 shrink-0 ml-auto">
              <Clock size={10} />
              {new Date(data.timestamp.replace(" ", "T")).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* ── Market data ── */}
      {marketData && <MarketCard data={marketData} />}

      {/* ── News ── */}
      {newsData && <NewsCard data={newsData} />}

      {/* ── Fundamentals ── */}
      {fundamentals && <FundamentalsCard data={fundamentals} />}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (query?: string) => {
    const q = (query || input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const data: TypedChatResponse = await sendChat(q);
      setMessages((m) => [...m, { role: "assistant", content: "", data }]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            err.response?.data?.detail || "Analysis failed. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="ml-56 flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="px-8 py-5 border-b border-bg-border flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent-green-dim border border-accent-green-border flex items-center justify-center">
            <Sparkles size={15} className="text-accent-green" />
          </div>
          <div>
            <h1 className="font-display font-700 text-text-primary">AI Chat</h1>
            <p className="text-text-muted text-xs">
              Ask about any stock — get analysis, not just prices
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-8 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent-green-dim border border-accent-green-border flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={28} className="text-accent-green" />
                </div>
                <h2 className="font-display text-xl font-700 text-text-primary">
                  Ask anything about stocks
                </h2>
                <p className="text-text-secondary text-sm mt-2 max-w-xs mx-auto">
                  I analyze market data, news, and fundamentals to give you
                  explainable insights.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => send(label)}
                    className="card card-hover p-3 text-left text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
                  >
                    <Icon size={13} className="text-accent-green shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={clsx(
                "animate-fade-up",
                msg.role === "user" ? "flex justify-end" : "",
              )}
            >
              {msg.role === "user" ? (
                <div className="bg-accent-green-dim border border-accent-green-border text-text-primary px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-lg text-sm">
                  {msg.content}
                </div>
              ) : msg.data ? (
                <AssistantCard data={msg.data} />
              ) : (
                <div className="card p-4 text-text-secondary text-sm max-w-lg">
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex gap-3 items-center animate-fade-in">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent-green animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <span className="text-text-muted text-xs font-mono">
                Analyzing...
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-8 py-4 border-t border-bg-border shrink-0">
          <div className="flex gap-3 max-w-3xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about a stock... e.g. Should I buy AAPL?"
              className="flex-1 px-4 py-3 text-sm"
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="btn-primary px-4"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
