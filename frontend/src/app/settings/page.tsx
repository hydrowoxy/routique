'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [updating, setUpdating] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const COOLDOWN_MS = 3000
  const TIMEOUT_MS = 16000

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login?message=session-expired')
    } else if (session?.user) {
      fetchProfile()
    }
  }, [loading, session, router])

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1000) {
            clearInterval(interval)
            return 0
          }
          return prev - 1000
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [cooldown])

  const fetchProfile = async () => {
    if (!session?.user) return

    const authUsername =
      session.user.user_metadata?.username ||
      session.user.email?.split('@')[0] ||
      'Unknown'
    setUsername(authUsername)

    const { data, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', session.user.id)
      .single()

    if (error) console.error('Error fetching profile:', error)
    setDisplayName(data?.display_name ?? '')
  }

  const handleUpdateProfile = async () => {
    if (!session?.user) return
    if (cooldown > 0 || updating) return

    setUpdating(true)
    setCooldown(COOLDOWN_MS)

    const timeout = setTimeout(() => {
      setUpdating(false)
      alert('Server took too long. Try again in a few seconds.')
    }, TIMEOUT_MS)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', session.user.id)

      clearTimeout(timeout)

      if (error) {
        alert(`Update failed: ${error.message}`)
      } else {
        alert('Profile updated successfully!')
      }
    } catch (err: unknown) {
      clearTimeout(timeout)
      if (err instanceof Error) {
        alert(`Unexpected error: ${err.message}`)
      } else {
        alert('Unexpected error: Unknown error')
      }
    } finally {
      setUpdating(false)
    }
  }

  const getUpdateButtonText = () => {
    if (updating) return 'Updating…'
    if (cooldown > 0) return `Wait ${Math.ceil(cooldown / 1000)}s`
    return 'Update Profile'
  }

  return (
    <div>
      <h1>Settings</h1>

      <div>
        <label>Username: {username}</label>
        <br />
        <small style={{ color: '#666' }}>Username cannot be changed</small>
      </div>

      <div>
        <label>Display Name:</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter display name"
          disabled={updating}
        />
      </div>

      <button onClick={handleUpdateProfile} disabled={updating || cooldown > 0}>
        {getUpdateButtonText()}
      </button>
      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  )

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (!error) router.push('/')
    else console.error('Logout failed:', error.message)
  }
}