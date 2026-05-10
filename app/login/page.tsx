"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "../api/route";
import { useAuthStore } from "@/store/auth";
import { TrendingUp, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] bg-grid pointer-events-none" />

      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-accent-green/10 blur-3xl rounded-full opacity-40" />

      <div className="w-full max-w-sm animate-fade-up relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent-green mx-auto flex items-center justify-center mb-4 shadow-lg glow-green">
            <TrendingUp size={22} className="text-void" strokeWidth={2.5} />
          </div>

          <h1 className="font-display text-2xl font-700 tracking-tight text-text-primary">
            FinCopilot
          </h1>

          <p className="text-text-secondary text-sm mt-1">
            Your AI stock analyst
          </p>
        </div>

        <div className="relative p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-xl">
          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-accent-green/10 to-transparent opacity-30 pointer-events-none" />

          <h2 className="text-text-primary font-display font-600 text-lg mb-5">
            Sign in
          </h2>

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm px-3 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-text-dim text-[11px] font-mono uppercase tracking-widest block mb-1.5">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-surface border border-border focus:border-accent-green/60 focus:ring-2 focus:ring-accent-green/20 transition outline-none"
              />
            </div>

            <div>
              <label className="text-text-dim text-[11px] font-mono uppercase tracking-widest block mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 text-sm pr-10 rounded-lg bg-surface border border-border focus:border-accent-green/60 focus:ring-2 focus:ring-accent-green/20 transition outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-primary transition"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex justify-center"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-5">
          No account?{" "}
          <Link href="/register" className="text-accent-green hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
