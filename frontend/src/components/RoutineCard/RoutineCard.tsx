'use client'

import Link from 'next/link'
import type { Database } from '@/lib/database.types'

type Routine = Database['public']['Tables']['routines']['Row']

type Props = {
  routine: Pick<Routine, 'id' | 'title' | 'description' | 'favourite_count' | 'view_count' | 'user_id' | 'image_path' | 'category'>
}

export default function RoutineCard({ routine }: Props) {
  const imageUrl = routine.image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/routines/${routine.image_path}`
    : null

  return (
    <Link href={`/routine/${routine.id}`}>
      <article>
        {imageUrl && (
          <img src={imageUrl} alt={routine.title} />
        )}

        <h2>{routine.title}</h2>

        {routine.category && (
            <p style={{ fontStyle: 'italic' }}>{routine.category}</p>
        )}

        <div>
          <span>{routine.view_count ?? 0} views</span> ·{' '}
          <span>{routine.favourite_count ?? 0} favorites</span>
        </div>
      </article>
    </Link>
  )
}
