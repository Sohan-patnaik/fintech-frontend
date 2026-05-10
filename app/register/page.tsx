'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/lib/api'
import { TrendingUp } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form.email, form.password, form.full_name)
      router.push('/login')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">

    <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-grid" />

    <div className="absolute top-100px left-1/2 -translate-x-1/2 w-400px h-400px bg-accent-green/10 blur-3xl rounded-full opacity-40" />

    <div className="w-full max-w-sm animate-fade-up relative z-10">

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent-green mx-auto flex items-center justify-center mb-4 shadow-lg glow-green">
          <TrendingUp size={22} className="text-void" strokeWidth={2.5} />
        </div>

        <h1 className="font-display text-2xl font-700 tracking-tight text-text-primary">
          FinCopilot
        </h1>

        <p className="text-text-secondary text-sm mt-1">
          Create your account
        </p>
      </div>

      <div className="relative p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-xl">

        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-accent-green/10 to-transparent opacity-30 pointer-events-none" />

        <h2 className="text-text-primary font-display font-600 text-lg mb-5">
          Get started
        </h2>

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {[
            { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Sohan Patnaik' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              
              <label className="text-text-dim text-[11px] font-mono uppercase tracking-widest block mb-1.5">
                {label}
              </label>

              <input
                type={type}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                required={key !== 'full_name'}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-surface border border-border focus:border-accent-green/60 focus:ring-2 focus:ring-accent-green/20 transition outline-none"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 flex justify-center"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="text-center text-text-secondary text-sm mt-5">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-accent-green hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  </div>
)}