"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { StatCard, SectionHeader,Spinner } from "@/components/ui";
import { getPortfolios, createPortfolio, analyzePortfolio, addTransaction } from "@/lib/api";
import { Portfolio } from "@/types";
import { Plus, Activity, ChevronRight, X } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#00FF94", "#4D9FFF", "#FFB830", "#FF4D6D", "#A78BFA"];

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selected, setSelected] = useState<Portfolio | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showTxn, setShowTxn] = useState(false);
  const [newName, setNewName] = useState("");
  const [txn, setTxn] = useState({ ticker: "", action: "BUY", quantity: 0, price: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await getPortfolios();
      setPortfolios(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createPortfolio(newName, []);
    setNewName("");
    setShowCreate(false);
    load();
  };

  const handleAnalyze = async () => {
    if (!selected) return;
    setLoadingAnalysis(true);
    try {
      const data = await analyzePortfolio(selected.id);
      setAnalysis(data);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleTxn = async () => {
    if (!selected || !txn.ticker) return;
    await addTransaction(selected.id, txn);
    setShowTxn(false);
    setTxn({ ticker: "", action: "BUY", quantity: 0, price: 0 });
    load();
  };

  const sectorData = analysis?.risk_data?.sector_exposure
    ? Object.entries(analysis.risk_data.sector_exposure).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader title="Portfolio" sub="Track and analyze your holdings" />
          <div className="flex gap-3">
            {selected && (
              <button
                onClick={() => setShowTxn(true)}
                className="px-4 py-2 rounded-xl bg-bg-card border border-bg-border text-sm font-body text-accent-muted hover:text-white transition-colors flex items-center gap-2"
              >
                <Plus size={14} /> Add Transaction
              </button>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-xl bg-accent-green text-bg font-display font-semibold text-sm hover:bg-accent-green/90 transition-all flex items-center gap-2"
            >
              <Plus size={14} /> New Portfolio
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Spinner size={28} /></div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-accent-muted font-body text-sm mb-4">No portfolios yet.</p>
            <button onClick={() => setShowCreate(true)} className="px-6 py-3 rounded-xl bg-accent-green text-bg font-display font-semibold text-sm">
              Create your first portfolio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">

            <div className="space-y-2">
              {portfolios.map((p) => (
                <div
                  key={p.id}
                  onClick={() => { setSelected(p); setAnalysis(null); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selected?.id === p.id
                      ? "bg-accent-green/10 border-accent-green/30 text-white"
                      : "bg-bg-card border-bg-border text-accent-muted hover:text-white hover:border-bg-hover"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold text-sm">{p.name}</p>
                      <p className="text-xs font-body mt-1 opacity-70">{p.holdings.length} holdings</p>
                    </div>
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>

            <div className="col-span-2 space-y-4">
              {selected && (
                <>
                  <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-bg-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-accent-green" />
                        <h2 className="font-display font-semibold text-sm text-white">{selected.name}</h2>
                      </div>
                      <button
                        onClick={handleAnalyze}
                        disabled={loadingAnalysis || selected.holdings.length === 0}
                        className="px-3 py-1.5 rounded-lg bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs font-display font-semibold hover:bg-accent-green/20 transition-colors disabled:opacity-40 flex items-center gap-2"
                      >
                        {loadingAnalysis ? <Spinner size={12} /> : null}
                        AI Analyze
                      </button>
                    </div>

                    {selected.holdings.length === 0 ? (
                      <div className="px-6 py-10 text-center text-accent-muted text-sm font-body">
                        No holdings yet. Add a transaction to get started.
                      </div>
                    ) : (
                      <div className="divide-y divide-bg-border">
                        <div className="grid grid-cols-4 px-6 py-2 text-xs font-body text-accent-muted uppercase tracking-wider">
                          <span>Ticker</span><span>Qty</span><span>Avg Price</span><span>Value</span>
                        </div>
                        {selected.holdings.map((h, i) => (
                          <div key={i} className="grid grid-cols-4 px-6 py-3 text-sm font-body hover:bg-bg-hover transition-colors">
                            <span className="font-display font-semibold text-white">{h.ticker}</span>
                            <span className="text-white font-mono">{h.qty}</span>
                            <span className="text-white font-mono">${h.avg_price}</span>
                            <span className="text-accent-green font-mono">${(h.qty * h.avg_price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {analysis?.risk_data && (
                    <div className="bg-bg-card border border-bg-border rounded-2xl p-6 space-y-4 animate-fade-up">
                      <h3 className="font-display font-semibold text-sm text-white">Risk Analysis</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <StatCard label="Risk Score" value={`${analysis.risk_data.risk_score}/100`}
                          color={analysis.risk_data.risk_score > 70 ? "red" : analysis.risk_data.risk_score > 40 ? "amber" : "green"} />
                        <StatCard label="Volatility" value={analysis.risk_data.volatility} color="amber" />
                        <StatCard label="Top Concentration" value={`${analysis.risk_data.concentration}%`} color="blue" />
                      </div>

                      {sectorData.length > 0 && (
                        <div className="grid grid-cols-2 gap-6 mt-4">
                          <div>
                            <p className="text-xs text-accent-muted font-body uppercase tracking-wider mb-3">Sector Exposure</p>
                            <ResponsiveContainer width="100%" height={160}>
                              <PieChart>
                                <Pie data={sectorData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                                  {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v: any) => `${v.toFixed(1)}%`} contentStyle={{ background: "#0D1117", border: "1px solid #1C2333", borderRadius: 8 }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div>
                            <p className="text-xs text-accent-muted font-body uppercase tracking-wider mb-3">Suggestions</p>
                            <ul className="space-y-2">
                              {analysis.risk_data.suggestions?.map((s: string, i: number) => (
                                <li key={i} className="text-xs font-body text-white/80 flex gap-2">
                                  <span className="text-accent-amber shrink-0">›</span>{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-card border border-bg-border rounded-2xl p-6 w-full max-w-sm animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white">New Portfolio</h3>
                <button onClick={() => setShowCreate(false)} className="text-accent-muted hover:text-white"><X size={16} /></button>
              </div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Portfolio name"
                className="w-full bg-bg border border-bg-border rounded-xl px-4 py-3 text-sm font-body text-white placeholder:text-accent-muted/50 focus:outline-none focus:border-accent-green/50 mb-4"
              />
              <button onClick={handleCreate} className="w-full py-3 rounded-xl bg-accent-green text-bg font-display font-semibold text-sm">
                Create
              </button>
            </div>
          </div>
        )}

        {showTxn && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-card border border-bg-border rounded-2xl p-6 w-full max-w-sm animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white">Add Transaction</h3>
                <button onClick={() => setShowTxn(false)} className="text-accent-muted hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                {[["Ticker", "ticker", "text", "AAPL"], ["Quantity", "quantity", "number", "10"], ["Price", "price", "number", "150"]].map(([label, field, type, ph]) => (
                  <div key={field as string}>
                    <label className="text-xs text-accent-muted font-body uppercase tracking-wider block mb-1">{label}</label>
                    <input
                      type={type as string}
                      placeholder={ph as string}
                      value={(txn as any)[field as string]}
                      onChange={(e) => setTxn({ ...txn, [field as string]: type === "number" ? +e.target.value : e.target.value.toUpperCase() })}
                      className="w-full bg-bg border border-bg-border rounded-xl px-4 py-2.5 text-sm font-body text-white placeholder:text-accent-muted/50 focus:outline-none focus:border-accent-green/50"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-accent-muted font-body uppercase tracking-wider block mb-1">Action</label>
                  <div className="flex gap-2">
                    {["BUY", "SELL"].map((a) => (
                      <button
                        key={a}
                        onClick={() => setTxn({ ...txn, action: a })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-colors ${
                          txn.action === a
                            ? a === "BUY" ? "bg-accent-green/20 text-accent-green border border-accent-green/30" : "bg-accent-red/20 text-accent-red border border-accent-red/30"
                            : "bg-bg border border-bg-border text-accent-muted"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleTxn} className="w-full py-3 rounded-xl bg-accent-green text-bg font-display font-semibold text-sm mt-2">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
