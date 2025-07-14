'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Nav() {
  const { session } = useAuth()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
        
        if (data?.username) {
          setUsername(data.username)
        }
      } else {
        setUsername(null)
      }
    }

    fetchUserProfile()
  }, [session])

  return (
    <nav>
      <Link href="/">Home</Link>
      {session ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/create">Create</Link>
          <Link href="/settings">Settings</Link>
          {username && <Link href={`/${username}`}>My Page</Link>}
        </>
      ) : (
        <>
          <Link href="/signup">Sign Up</Link>
          <Link href="/login">Log In</Link>
        </>
      )}
    </nav>
  )
}