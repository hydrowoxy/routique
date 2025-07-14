import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'          

export default async function RoutinePage({ params }: { params: { id: string } }) {
  const { id } = await params

  const { data: routine, error } = await supabase
    .from('routines')
    .select(`id, title, description, image_path,
             tags, favourite_count, view_count, notes,
             products,
             profiles: user_id ( id, username, display_name )`)
    .eq('id', id)
    .single()

  if (error) {
    console.error('[routine fetch]', error.message)
  }
  if (!routine) return notFound()

  supabase
    .from('routines')
    .update({ view_count: (routine.view_count ?? 0) + 1 })
    .eq('id', id)

  let imageUrl: string | null = null
  if (routine.image_path) {
    const { data } = supabase.storage
      .from('routines')
      .getPublicUrl(routine.image_path)
    imageUrl = data.publicUrl
  }

  return (
    <main>
      <h1>{routine.title}</h1>
      <p>
        by&nbsp;
        <a href={`/${routine.profiles.username}`}>
          {routine.profiles.display_name || routine.profiles.username}
        </a>
      </p>

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={routine.title} width={320} />
      )}

      <p>{routine.description}</p>
      {routine.notes && (
        <>
          <h2>Notes</h2>
          <p>{routine.notes}</p>
        </>
      )}

      {Array.isArray(routine.products) && routine.products.length > 0 && (
        <>
          <h2>Products</h2>
          <ul>
            {routine.products.map((p: { name: string; links: string[] }) => (
              <li key={p.name}>
                {p.name}
                {p.links?.map((l) => (
                  <a key={l} href={l} target="_blank">
                    &nbsp;🔗 
                  </a>
                ))}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* tags */}
      {Array.isArray(routine.tags) && routine.tags.length > 0 && (
        <p>
          {routine.tags.map((t: string) => (
            <span key={t}>#{t}&nbsp;</span>
          ))}
        </p>
      )}

      <p>
        {routine.view_count} views&nbsp;·&nbsp;
        {routine.favourite_count} favorites
      </p>

      {/* TODO: favourite button & share-link copy button */}
    </main>
  )
}
