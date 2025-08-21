import { supabase } from "@/lib/supabase";

/** Admin utility to clean up orphaned images */
export async function cleanupOrphanedImages() {
  try {
    // Get all routine images
    const { data: files, error: listError } = await supabase.storage
      .from("routines")
      .list();

    if (listError) throw listError;

    // Get all image_path values from routines table
    const { data: routines, error: routinesError } = await supabase
      .from("routines")
      .select("image_path")
      .not("image_path", "is", null);

    if (routinesError) throw routinesError;

    const usedImages = new Set(routines.map(r => r.image_path));
    const orphanedFiles = files?.filter(file => !usedImages.has(file.name)) || [];

    if (orphanedFiles.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from("routines")
        .remove(orphanedFiles.map(f => f.name));

      if (deleteError) throw deleteError;
      
      console.log(`Cleaned up ${orphanedFiles.length} orphaned routine images`);
    }

    return { success: true, cleaned: orphanedFiles.length };
  } catch (error) {
    console.error("Failed to cleanup orphaned images:", error);
    return { success: false, error };
  }
}