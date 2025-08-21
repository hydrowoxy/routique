"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext"; 

import TitleInput from "./TitleInput/TitleInput";
import DescriptionInput from "./DescriptionInput/DescriptionInput";
import NotesInput from "./NotesInput/NotesInput";
import ProductInput from "./ProductInput/ProductInput";
import StepsInput from "./StepsInput/StepsInput"; 
import ImageInput from "./ImageInput/ImageInput";
import CategoryInput from "./CategoryInput/CategoryInput"; 
import Loading from "../Loading/Loading";

import { useRouter } from "next/navigation";
import { validateRoutine } from "@/utils/validateRoutine";

import styles from "./RoutineForm.module.scss";
import AccentButton from "../AccentButton/AccentButton";

type Product = { name: string; links: string[] };
type Step = { step_no: number; body: string };

export default function RoutineForm() {
  const { session, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useToast(); 
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [steps, setSteps] = useState<Step[]>([]); 
  const [category, setCategory] = useState(""); 

  const [imageKey, setImageKey] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !session?.user) {
      router.push("/login");
    }
  }, [authLoading, session, router]);

  if (authLoading || !session?.user) return <Loading />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      showError("Please select a category.");
      return;
    }

    const check = validateRoutine({
      title,
      description,
      notes,
      imagePath: imageKey,
      products,
    });

    if (!check.ok) {
      showError(check.msg!, 8000);
      return;
    }

    const { cleanedProducts } = check.data!;
    setSaving(true);

    // Create the routine first
    const routineId = crypto.randomUUID();
    const { error: routineError } = await supabase.from("routines").insert({
      id: routineId,
      user_id: session.user.id,
      title: title.trim(),
      description: description.trim(),
      image_path: imageKey,
      notes: notes.trim(),
      products: cleanedProducts,
      category, 
      view_count: 0,
      favourite_count: 0,
    });

    if (routineError) {
      setSaving(false);
      showError(routineError.message);
      return;
    }

    // If there are steps, insert them
    if (steps.length > 0) {
      const stepsToInsert = steps.map(step => ({
        routine_id: routineId,
        step_no: step.step_no,
        body: step.body.trim(),
      }));

      const { error: stepsError } = await supabase
        .from("routine_steps")
        .insert(stepsToInsert);

      if (stepsError) {
        setSaving(false);
        showError(`Routine created but steps failed to save: ${stepsError.message}`);
        return;
      }
    }

    setSaving(false);
    showSuccess("Routine created successfully! Redirecting...");
    
    // Reset form
    setTitle("");
    setDescription("");
    setNotes("");
    setProducts([]);
    setSteps([]); // Reset steps
    setCategory(""); 
    setImageKey("");
    setPreviewUrl("");

    const username = session.user.user_metadata?.username;
    if (username) {
      setTimeout(() => router.push(`/${username}`), 1000);
    }
  };

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

      <TitleInput value={title} onChange={setTitle} />
      <DescriptionInput value={description} onChange={setDescription} />
      <CategoryInput value={category} onChange={setCategory} /> 

      <ProductInput products={products} onChange={setProducts} />
      <StepsInput steps={steps} onChange={setSteps} /> 
      <NotesInput value={notes} onChange={setNotes} />

      <AccentButton type="submit" disabled={saving || !title.trim() || !imageKey}>
        {saving ? "Saving…" : "Create Routine"}
      </AccentButton>
    </form>
  );
}
