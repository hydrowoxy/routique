'use client'

import Link from 'next/link'
import type { Database } from '@/lib/database.types'

type Routine = Database['public']['Tables']['routines']['Row']

type Props = {
  routine: Routine
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
        {routine.description && <p>{routine.description}</p>}

        {routine.tags && routine.tags.length > 0 && (
          <ul>
            {routine.tags.map((tag, idx) => (
              <li key={idx}>{tag}</li>
            ))}
          </ul>
        )}

        <div>
          <span>{routine.view_count ?? 0} views</span> ·{' '}
          <span>{routine.favourite_count ?? 0} favorites</span>
        </div>
      </article>
    </Link>
  )
}
