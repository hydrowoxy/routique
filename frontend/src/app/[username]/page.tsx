import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RoutineGrid from "@/components/RoutineGrid/RoutineGrid"; 

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
      "id, title, description, image_path, favourite_count, view_count, user_id, category" 
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
      <RoutineGrid routines={routines ?? []} /> 
      {/* todo Render public profile info here */}
    </div>
  );
}
