import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

import Header from "@/components/RoutinePage/Header/Header";
import Image from "@/components/RoutinePage/Image/Image";
import Notes from "@/components/RoutinePage/Notes/Notes";
import Products from "@/components/RoutinePage/Products/Products";
import FavouriteArea from "@/components/RoutinePage/FavouriteArea/FavouriteArea";
import ViewArea from "../../../components/RoutinePage/ViewArea/ViewArea";
import OwnerOnly from "@/components/RoutinePage/OwnerOnly/OwnerOnly";

import styles from "@/components/RoutinePage/RoutinePage.module.scss";


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
             favourite_count, view_count, notes,
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
    <main className={styles.page}>
      {/* everything else stays the same for now */}
      {routine.image_path && <Image image_path={routine.image_path} />}

      <Header
        title={routine.title}
        profile={Array.isArray(routine.profiles) ? routine.profiles[0] : routine.profiles}
      />

      <ViewArea routineId={routine.id} initialViews={routine.view_count} />
      <FavouriteArea id={routine.id} initialFavourites={routine.favourite_count} />

      <p className={styles.title}>Description</p>
      <p className={styles.description}>{routine.description}</p>
      
      {Array.isArray(routine.products) && routine.products.length > 0 && (
        <section className={styles.sectionGap}>
          <Products products={routine.products} />
        </section>
      )}

      {routine.notes && (
        <section className={styles.sectionGap}>
          <Notes notes={routine.notes} />
        </section>
      )}

      <OwnerOnly routineId={id} imageKey={routine.image_path} ownerId={profile.id} />

    </main>
  );
}
