'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './ViewArea.module.scss'

export default function ViewArea({
  routineId,
  initialViews
}: {
  routineId: string
  initialViews: number | null
}) {
  const [views, setViews] = useState(initialViews ?? 0)

  useEffect(() => {
    const run = async () => {
      const key = `viewed-${routineId}`
      const last = localStorage.getItem(key)
      const now = Date.now()

      if (!last || now - Number(last) > 60 * 60 * 1000) {
        const { error } = await supabase.rpc('increment_view_count', { rid: routineId })
        if (error) {
          console.error('RPC error:', error)
          return
        }
        setViews(v => v + 1)
        localStorage.setItem(key, now.toString())
      }
    }

    if (typeof window !== 'undefined') run()
  }, [routineId])

  return <span className={styles.views}>{views} views</span>
}
