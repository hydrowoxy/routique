'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

import Input from '@/components/Input/Input'
import AccentButton from '@/components/AccentButton/AccentButton'
import styles from '@/components/Login/Login.module.scss'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { session, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && session) {
      const redirectToProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()

        if (profile?.username) {
          router.push(`/${profile.username}`)
        } else {
          router.push('/')
        }
      }
      redirectToProfile()
    }
  }, [session, authLoading, router])

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    })
    
    setLoading(false)

    if (error) {
      setError(error.message)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

return (
  <div className={styles.container}>
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>Login</h1>
        <div className={styles.signupPrompt}>
          <span>Don&apos;t have an account?</span>
          <Link href="/signup" className={styles.signupLink}>
            Sign up
          </Link>
        </div>
      </div>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.inputGroup}>
          <label>Email</label>
          <Input
            type="email"
            placeholder="ex: jon.smith@email.com"
            value={email}
            onChange={setEmail}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Password</label>
          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className={styles.passwordInput}
            />
            <button
              type="button"
              className={styles.showPasswordButton}
              onClick={() => {
                console.log('Toggle clicked, current showPassword:', showPassword)
                setShowPassword(!showPassword)
              }}
              disabled={loading}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <Link href="/forgot-password" className={styles.forgotPassword}>
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <AccentButton
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? 'Logging in...' : 'Login'}
        </AccentButton>
      </form>
    </div>
  </div>
)
}