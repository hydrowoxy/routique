import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RoutineCard from "@/components/RoutineCard/RoutineCard";

export const dynamic = "force-dynamic";

export default async function UsernamePage(props: {
  params: Promise<{ username: string }>;
}) {
  const params = await props.params;
  const { username } = params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .single();

  if (!profile) return notFound();

  const { data: routines, error: routinesError } = await supabase
    .from("routines")
    .select(
      "id, title, description, image_path, tags, favourite_count, view_count, user_id"
    )
    .eq("user_id", profile.id);

  if (routinesError) {
    console.error(routinesError);
  }

  return (
    <div>
      <h1>
        {profile.display_name} {profile.username}&apos;s Routines
      </h1>
      {routines?.map((r) => (
        <RoutineCard key={r.id} routine={r} />
      ))}
      {/* todo Render public profile info here */}
    </div>
  );
}
