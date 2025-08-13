import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RoutineGrid from "@/components/RoutineGrid/RoutineGrid";
import ProfileHeader from "@/components/ProfileHeader/ProfileHeader";

export const dynamic = "force-dynamic";

export default async function UsernamePage(props: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await props.params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_path")
    .eq("username", username)
    .single();

  if (!profile) return notFound();

  const { data: routines, error: routinesError } = await supabase
    .from("routines")
    .select(
      "id, title, description, image_path, favourite_count, view_count, user_id, category"
    )
    .eq("user_id", profile.id);

  if (routinesError) console.error(routinesError);

  // when you have publicUrlFromPath, map avatar_path -> URL:
  const avatarUrl = null; // or publicUrlFromPath("avatars", profile.avatar_path)

  return (
    <div>
      <ProfileHeader
        displayName={profile.display_name ?? profile.username}
        username={profile.username}
        avatarUrl={avatarUrl}
      />

      <RoutineGrid routines={routines ?? []} showUsernames={false} />
    </div>
  );
}
