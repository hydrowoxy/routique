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

export default function RoutineForm() {
  const { session, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useToast(); 
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState([{ name: "", links: [""] }]);
  const [steps, setSteps] = useState([{ step_no: 1, body: "" }]); 
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
      steps, 
    });

    if (!check.ok) {
      showError(check.msg!, 8000);
      return;
    }

    setSaving(true);

    try {
      // Insert routine
      const { data: routineData, error: routineError } = await supabase
        .from("routines")
        .insert({
          user_id: session.user.id,
          title: title.trim(),
          description: description.trim(),
          notes: notes.trim(),
          category,
          image_path: imageKey,
        })
        .select("id")
        .single();

      if (routineError) throw routineError;

      const routineId = routineData.id;

      // Insert products
      if (check.data!.cleanedProducts.length > 0) {
        const productsToInsert = check.data!.cleanedProducts.map((p) => ({
          routine_id: routineId,
          name: p.name,
          links: p.links,
        }));

        const { error: productsError } = await supabase
          .from("products")
          .insert(productsToInsert);

        if (productsError) throw productsError;
      }

      // Insert steps
      if (check.data!.cleanedSteps.length > 0) {
        const stepsToInsert = check.data!.cleanedSteps.map((s) => ({
          routine_id: routineId,
          step_no: s.step_no,
          body: s.body,
        }));

        const { error: stepsError } = await supabase
          .from("steps")
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;
      }

      showSuccess("Routine created successfully!");
      router.push(`/routine/${routineId}`);
    } catch (err) {
      console.error("Error creating routine:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      showError(`Failed to create routine: ${msg}`);
    } finally {
      setSaving(false);
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
