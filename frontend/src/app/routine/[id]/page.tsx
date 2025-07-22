import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

import Header from "@/components/RoutinePage/Header/Header";
import Image from "@/components/RoutinePage/Image/Image";
import Notes from "@/components/RoutinePage/Notes/Notes";
import Products from "@/components/RoutinePage/Products/Products";
import Tags from "@/components/RoutinePage/Tags/Tags";
import FavouriteArea from "@/components/RoutinePage/FavouriteArea/FavouriteArea";
import ViewArea from "../../../components/RoutinePage/ViewArea/ViewArea";
import ShareButton from "@/components/RoutinePage/ShareButton/ShareButton";
import OwnerOnly from "@/components/RoutinePage/OwnerOnly/OwnerOnly";

export const dynamic = "force-dynamic";

export default async function RoutinePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const { data: routine, error } = await supabase
    .from("routines")
    .select(
      `id, title, description, image_path,
             tags, favourite_count, view_count, notes,
             products,
             profiles: user_id ( id, username, display_name )`
    )
    .eq("id", id)
    .single();

  if (error) console.error("[routine fetch]", error.message);
  if (!routine) return notFound();

  // Fix only: handle array vs object for profiles
  const profile = (Array.isArray(routine.profiles)
    ? routine.profiles[0]
    : routine.profiles) as {
    id: string;
    username: string;
    display_name: string | null;
  };

  return (
    <main>
      <Header
        title={routine.title}
        profile={Array.isArray(routine.profiles) ? routine.profiles[0] : routine.profiles}
      />

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
        initialFavourites={routine.favourite_count}
      />

      <ViewArea routineId={routine.id} initialViews={routine.view_count} />
      <ShareButton routineId={id} />

      {/* Only show if current user is the owner */}
      <OwnerOnly
        routineId={id}
        imageKey={routine.image_path}
        ownerId={profile.id}
      />
    </main>
  );
}
