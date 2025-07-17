import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import Header from '@/components/RoutinePage/Header/Header'
import Image from '@/components/RoutinePage/Image/Image'
import Notes from '@/components/RoutinePage/Notes/Notes'
import Products from '@/components/RoutinePage/Products/Products'
import Tags from '@/components/RoutinePage/Tags/Tags'
import FavouriteArea from '@/components/RoutinePage/FavouriteArea/FavouriteArea'
import ViewArea from '../../../components/RoutinePage/ViewArea/ViewArea'
import ShareButton from '@/components/RoutinePage/ShareButton/ShareButton'
import EditButton from '@/components/RoutinePage/EditButton/EditButton'
import DeleteButton from '../../../components/RoutinePage/DeleteButton/DeleteButton'

export const dynamic = 'force-dynamic';

export default async function RoutinePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: routine, error } = await supabase
    .from('routines')
    .select(`id, title, description, image_path,
             tags, favourite_count, view_count, notes,
             products,
             profiles: user_id ( id, username, display_name )`)
    .eq('id', id)
    .single();

  if (error) console.error('[routine fetch]', error.message);
  if (!routine) return notFound();

  // Fetch current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Increment view count (non-blocking)
  supabase
    .from('routines')
    .update({ view_count: (routine.view_count ?? 0) + 1 })
    .eq('id', id);

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

      <FavouriteArea
        id={routine.id}
        initialViews={routine.view_count}
        initialFavourites={routine.favourite_count}
      />

      <ViewArea routineId={routine.id} initialViews={routine.view_count} />
      <ShareButton routineId={id} />

      {/* Only show if current user is the owner */}
      {session?.user.id === routine.profiles.id && (
        <>
          <EditButton routineId={id} />
          <DeleteButton routineId={id} imageKey={routine.image_path} />
        </>
      )}
    </main>
  );
}
