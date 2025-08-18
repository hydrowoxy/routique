import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RoutineGrid from "@/components/RoutineGrid/RoutineGrid";
import ProfileHeader from "@/components/ProfileHeader/ProfileHeader";

export const dynamic = "force-dynamic";

// tiny helper
function publicUrlFromPath(bucket: string, path?: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export default async function UsernamePage({
  params,
}: {
  params: Promise<{ username: string }>; 
}) {
  const { username } = await params; 

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_path")
    .eq("username", username)
    .single();

  if (profileErr || !profile) return notFound();

  const { data: routines, error: routinesError } = await supabase
    .from("routines")
    .select(
      "id, title, description, image_path, favourite_count, view_count, user_id, category"
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (routinesError) console.error("[routines]", routinesError.message);

  const avatarUrl = publicUrlFromPath("avatars", profile.avatar_path);

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