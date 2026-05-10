'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { init, isAuth } = useAuthStore()

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (!isAuth) router.push('/login')
  }, [isAuth])

  return (
    <div className="flex min-h-screen bg-void">
      <Sidebar />

      <main className="flex-1 min-h-screen p-6">
        <div className="max-w-7xl mx-auto animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  )
}