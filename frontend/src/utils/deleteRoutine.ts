import { supabase } from "@/lib/supabase";

export async function deleteRoutine(routineId: string, userId: string) {
  try {
    // First, get the routine to find the image_path
    const { data: routine, error: fetchError } = await supabase
      .from("routines")
      .select("image_path, user_id")
      .eq("id", routineId)
      .single();

    if (fetchError) {
      return { error: fetchError };
    }

    // Check if user owns this routine
    if (routine.user_id !== userId) {
      return { error: new Error("Unauthorized") };
    }

    // Delete the routine from database
    const { error: deleteError } = await supabase
      .from("routines")
      .delete()
      .eq("id", routineId)
      .eq("user_id", userId); // Extra safety check

    if (deleteError) {
      return { error: deleteError };
    }

    // Delete the associated image from storage if it exists
    if (routine.image_path) {
      const { error: storageError } = await supabase.storage
        .from("routines")
        .remove([routine.image_path]);
      
      if (storageError) {
        console.warn("Failed to delete routine image:", storageError);
        // Don't return error since routine is already deleted
      }
    }

    return { error: null };
  } catch (err) {
    return { error: err };
  }
}