"use client";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { SectionHeader, Spinner } from "@/components/ui";
import { getNews } from "@/lib/api";
import { Search, ExternalLink, Newspaper } from "lucide-react";
import { motion } from "framer-motion";

const QUICK_TICKERS = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL", "AMZN", "META"];

export default function NewsPage() {
  const [ticker, setTicker] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");
  const [error, setError] = useState("");

  const search = async (t: string) => {
    const sym = t.trim().toUpperCase();
    if (!sym) return;
    setLoading(true);
    setError("");
    setArticles([]);
    setSearched(sym);
    try {
      const data = await getNews(sym);
      setArticles(data.articles || []);
      if (!data.articles?.length) setError(`No articles found for ${sym}`);
    } catch {
      setError("Failed to fetch news. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-8">
        <SectionHeader
          title="Market News"
          sub="Live insights, sentiment & updates"
        />

        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && search(ticker)}
              placeholder="Search stocks (e.g. AAPL, TSLA)..."
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
            />
          </div>
          <button
            onClick={() => search(ticker)}
            disabled={loading || !ticker.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-blue-500 text-black font-semibold text-sm shadow-md hover:opacity-90 transition disabled:opacity-40"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-10">
          {QUICK_TICKERS.map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setTicker(t);
                search(t);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:border-emerald-400/30 transition"
            >
              {t}
            </motion.button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24 gap-3">
            <Spinner size={24} />
            <span className="text-gray-400 text-sm">
              Fetching news for {searched}...
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <Newspaper size={40} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-white text-lg font-semibold">{searched}</h2>
              <span className="text-gray-400 text-sm">
                {articles.length} articles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {articles.map((a, i) => (
                <motion.a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="block bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-md hover:border-emerald-400/30 transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-sm text-white leading-relaxed line-clamp-3 group-hover:text-emerald-400 transition">
                      {a.headline}
                    </p>
                    <ExternalLink
                      size={14}
                      className="text-gray-400 shrink-0 mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">
                      {a.publisher || "Unknown"}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold tracking-wider">
                      {searched}
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && articles.length === 0 && !searched && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
              <Newspaper size={28} className="text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">Search for market news</p>
              <p className="text-gray-400 text-sm">
                Try a ticker or pick from above
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
