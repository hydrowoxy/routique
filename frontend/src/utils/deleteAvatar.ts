import { supabase } from "@/lib/supabase";

export async function deleteAvatar(key: string) {
  return await supabase.storage.from("avatars").remove([key]);
}
