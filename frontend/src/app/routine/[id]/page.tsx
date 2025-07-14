import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import Header from '@/components/RoutinePage/Header/Header'
import Image from '@/components/RoutinePage/Image/Image'
import Notes from '@/components/RoutinePage/Notes/Notes'
import Products from '@/components/RoutinePage/Products/Products'
import Tags from '@/components/RoutinePage/Tags/Tags'
import Meta from '@/components/RoutinePage/Meta/Meta'

export const dynamic = 'force-dynamic'

export default async function RoutinePage({ params }: { params: { id: string } }) {
  const { id } = params

  const { data: routine, error } = await supabase
    .from('routines')
    .select(`id, title, description, image_path,
             tags, favourite_count, view_count, notes,
             products,
             profiles: user_id ( id, username, display_name )`)
    .eq('id', id)
    .single()

  if (error) console.error('[routine fetch]', error.message)
  if (!routine) return notFound()

  // Update view count (not awaited on purpose)
  supabase
    .from('routines')
    .update({ view_count: (routine.view_count ?? 0) + 1 })
    .eq('id', id)

  return (
    <main>
      <Header title={routine.title} profile={routine.profiles} />

      {routine.image_path && <Image image_path={routine.image_path} />}

      <p>{routine.description}</p>

      {routine.notes && <Notes notes={routine.notes} />}

      {Array.isArray(routine.products) && routine.products.length > 0 && (
        <Products products={routine.products} />
      )}

      {Array.isArray(routine.tags) && routine.tags.length > 0 && (
        <Tags tags={routine.tags} />
      )}

      <Meta
        id={routine.id}
        views={routine.view_count}
        favourites={routine.favourite_count}
      />
    </main>
  )
}
