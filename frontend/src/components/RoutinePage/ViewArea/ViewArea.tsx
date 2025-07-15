'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

      console.log('Last view timestamp:', last)

      if (!last || now - Number(last) > 60 * 60 * 1000) {
        const { error } = await supabase.rpc('increment_view_count', { rid: routineId })

        if (error) {
          console.error('RPC error:', error)
          return
        }

        console.log('View incremented')

        setViews(v => v + 1)
        localStorage.setItem(key, now.toString())
      } else {
        console.log('Skipping, recently viewed')
      }
    }

    if (typeof window !== 'undefined') {
      run()
    }
  }, [routineId])

  return <span>{views} views</span>
}
