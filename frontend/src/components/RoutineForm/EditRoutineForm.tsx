"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

import TitleInput       from "./TitleInput/TitleInput";
import DescriptionInput from "./DescriptionInput/DescriptionInput";
import NotesInput       from "./NotesInput/NotesInput";
import ProductInput     from "./ProductInput/ProductInput";
import StepsInput       from "./StepsInput/StepsInput"; 
import ImageInput       from "./ImageInput/ImageInput";
import CategoryInput    from "./CategoryInput/CategoryInput"; 
import Loading          from "../Loading/Loading";

import { validateRoutine } from "@/utils/validateRoutine";
import { deleteImage }     from "@/utils/deleteImage";

import styles from "./RoutineForm.module.scss";
import AccentButton from "../AccentButton/AccentButton";
import Button from "../Button/Button";

type Product = { name: string; links: string[] };
type Step = { step_no: number; body: string };

export default function EditRoutineForm({ routineId }: { routineId: string }) {
  const { session, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useToast();
  const router = useRouter();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [authed,   setAuthed]   = useState(false);

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [notes,       setNotes]       = useState("");
  const [products,    setProducts]    = useState<Product[]>([]);
  const [steps,       setSteps]       = useState<Step[]>([]); 
  const [category,    setCategory]    = useState(""); 
  const [imageKey,    setImageKey]    = useState("");
  const [previewUrl,  setPreviewUrl]  = useState("");

  const originalKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setAuthed(true);
  }, [authLoading, session?.user, router]);

  useEffect(() => {
    if (!authed) return;

    let cancelled = false;

    (async () => {
      // Fetch routine data
      const { data: routineData, error: routineError } = await supabase
        .from("routines")
        .select("*")
        .eq("id", routineId)
        .single();

      if (cancelled) return;

      if (routineError || !routineData || routineData.user_id !== session!.user!.id) {
        router.push("/404");
        return;                        
      }

      // Fetch steps data
      const { data: stepsData, error: stepsError } = await supabase
        .from("routine_steps")
        .select("*")
        .eq("routine_id", routineId)
        .order("step_no");

      if (cancelled) return;

      // Set routine data
      setTitle(routineData.title ?? "");
      setDescription(routineData.description ?? "");
      setNotes(routineData.notes ?? "");
      setProducts(
        (routineData.products || []).map((p: Product) => ({
          name: p.name ?? "",
          links: [...(p.links || [])],
        }))
      );
      setCategory(routineData.category ?? ""); 

      // Set steps data
      if (!stepsError && stepsData) {
        setSteps(stepsData.map(step => ({
          step_no: step.step_no,
          body: step.body,
        })));
      }

      if (routineData.image_path) {
        originalKeyRef.current = routineData.image_path;
        setImageKey(routineData.image_path);

        const { data: urlData } = supabase.storage
          .from("routines")
          .getPublicUrl(routineData.image_path);
        setPreviewUrl(urlData?.publicUrl || "");
      }

      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [authed, routineId, session, router]);

  const updateProducts = (list: Product[]) =>
    setProducts(list.map(p => ({ name: p.name, links: [...p.links] })));

  const handleCancel = async () => {
    if (imageKey && imageKey !== originalKeyRef.current) {
      await deleteImage(imageKey);
    }
    router.push(`/routine/${routineId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //console.log("Submitting with imageKey:", imageKey); 

    if (!category) {
      showError("Please select a category.");
      return;
    }

    //console.log("Form data being validated:", {
    //  title,
    //  description, 
    //  notes,
    //  imagePath: imageKey,
    //  products,
    //  steps 
    //});

    const check = validateRoutine({
      title,
      description,
      notes,
      imagePath: imageKey, 
      products,
      steps, 
    });

    if (!check.ok) {
      console.warn("Validation failed:", check.msg); 
      showError(check.msg!, 8000);
      return;
    }

    const { cleanedProducts } = check.data!;
    setSaving(true);

    try {
      // Update the routine
      const { error: routineError } = await supabase
        .from("routines")
        .update({
          title: title.trim(),
          description: description.trim(),
          image_path: imageKey,
          notes: notes.trim(),
          products: cleanedProducts,
          category, 
        })
        .eq("id", routineId);

      if (routineError) throw routineError;

      // Delete existing steps and insert new ones
      const { error: deleteError } = await supabase
        .from("routine_steps")
        .delete()
        .eq("routine_id", routineId);

      if (deleteError) throw deleteError;

      // Insert new steps if any exist
      if (steps.length > 0) {
        const stepsToInsert = steps
          .filter(step => step.body.trim()) // Only insert steps with content
          .map(step => ({
            routine_id: routineId,
            step_no: step.step_no,
            body: step.body.trim(),
          }));

        if (stepsToInsert.length > 0) {
          const { error: stepsError } = await supabase
            .from("routine_steps")
            .insert(stepsToInsert);

          if (stepsError) throw stepsError;
        }
      }

      // Delete old image if it was replaced
      if (originalKeyRef.current && originalKeyRef.current !== imageKey) {
        //console.log("Deleting replaced image:", originalKeyRef.current); 
        await deleteImage(originalKeyRef.current);
      }

      showSuccess("Changes saved successfully! Redirecting...");
      setTimeout(() => router.push(`/routine/${routineId}`), 1000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showError(error.message || "Failed to save changes");
      } else {
        showError("Failed to save changes");
      }
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !authed || loading) return <Loading />;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <ImageInput
        existingUrl={previewUrl}
        onUpload={(newKey) => {
          setImageKey(newKey);
          const { data } = supabase.storage
            .from("routines")
            .getPublicUrl(newKey);
          setPreviewUrl(data?.publicUrl || "");
        }}
      />
      <TitleInput       value={title}       onChange={setTitle} />
      <DescriptionInput value={description} onChange={setDescription} />
      <CategoryInput    value={category}    onChange={setCategory} /> 

      <ProductInput products={products} onChange={updateProducts} />
      <StepsInput steps={steps} onChange={setSteps} /> 
      <NotesInput  value={notes} onChange={setNotes} />

      <div className={styles.actions}>
        <AccentButton type="submit" disabled={saving || !title.trim() || !imageKey}>
          {saving ? "Saving…" : "Save Changes"}
        </AccentButton>

        <Button type="button" onClick={handleCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
