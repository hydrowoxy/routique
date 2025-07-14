'use client'
import { useState } from 'react'
export default function ShareButton({ routineId }: { routineId: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/routine/${routineId}`

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Could not copy link. Please copy manually.')
    }
  }

  return (
    <button onClick={handleClick} style={{ marginLeft: 4 }}>
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
