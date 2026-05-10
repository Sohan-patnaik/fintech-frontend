import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Premium Stat Card
export function StatCard({ label, value, sub, color = "green" }: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "green" | "red" | "blue" | "amber";
}) {
  const colors = {
    green: "text-emerald-400",
    red: "text-red-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-6 transition-all"
    >
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-2">{sub}</p>}
    </motion.div>
  );
}

export function Badge({ label, type }: {
  label: string;
  type: "buy" | "sell" | "hold" | "info" | "bullish" | "bearish" | "neutral";
}) {
  const styles = {
    buy: "bg-emerald-500/10 text-emerald-400 border-emerald-400/30",
    bullish: "bg-emerald-500/10 text-emerald-400 border-emerald-400/30",
    sell: "bg-red-500/10 text-red-400 border-red-400/30",
    bearish: "bg-red-500/10 text-red-400 border-red-400/30",
    hold: "bg-amber-500/10 text-amber-400 border-amber-400/30",
    neutral: "bg-amber-500/10 text-amber-400 border-amber-400/30",
    info: "bg-blue-500/10 text-blue-400 border-blue-400/30",
  };

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition ${styles[type]}`}
    >
      {label}
    </motion.span>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="rounded-full border-2 border-t-transparent border-emerald-400 animate-spin shadow-md"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
      {sub && <p className="text-gray-400 mt-2 text-sm">{sub}</p>}
      <div className="h-[2px] w-16 bg-gradient-to-r from-emerald-400 to-blue-500 mt-3 rounded-full" />
    </div>
  );
}
