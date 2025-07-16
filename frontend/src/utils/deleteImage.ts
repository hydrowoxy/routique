import { supabase } from "@/lib/supabase";

export async function deleteImage(key: string) {
  if (!key) return { error: "No key provided" };

  const { error } = await supabase.storage.from("routines").remove([key]);
  return { error };
}
