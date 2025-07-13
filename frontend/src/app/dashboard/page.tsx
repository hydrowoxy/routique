'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login')
    }
  }, [session, loading, router])

  if (loading || !session) return null

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard, {session.user.email}!</p>
    </div>
  )
}