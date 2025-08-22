"use client";

import { useState, useEffect, useRef } from "react";
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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null); // NEW: Store selected file
  const imageInputRef = useRef<{ uploadStoredFile: () => Promise<string | null> } | null>(null); // Ref to access upload method

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !session?.user) {
      router.push("/login");
    }
  }, [authLoading, session, router]);

  if (authLoading || !session?.user) return <Loading />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      showError("Please log in to create a routine.");
      return;
    }

    if (!category) {
      showError("Please select a category.");
      return;
    }

    // Upload image if one is selected
    let finalImageKey = imageKey;
    if (selectedImageFile && imageInputRef.current) {
      const uploadedKey = await imageInputRef.current.uploadStoredFile();
      if (uploadedKey) {
        finalImageKey = uploadedKey;
      } else {
        showError("Failed to upload image.");
        return;
      }
    }

    const check = validateRoutine({
      title,
      description,
      notes,
      imagePath: finalImageKey,
      products,
      steps,
    });

    if (!check.ok) {
      showError(check.msg!);
      return;
    }

    setSaving(true);

    try {
      // Insert routine with products as JSON
      const { data: routineData, error: routineError } = await supabase
        .from("routines")
        .insert({
          user_id: session.user.id,
          title: title.trim(),
          description: description.trim(),
          notes: notes.trim(),
          category,
          image_path: finalImageKey,
          products: check.data!.cleanedProducts,
        })
        .select("id")
        .single();

      if (routineError) throw routineError;

      const routineId = routineData.id;

      // Insert steps into routine_steps table
      if (check.data!.cleanedSteps.length > 0) {
        const stepsToInsert = check.data!.cleanedSteps.map((s) => ({
          routine_id: routineId,
          step_no: s.step_no,
          body: s.body,
        }));

        const { error: stepsError } = await supabase
          .from("routine_steps") 
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

  const handleImageSelect = (file: File | null) => {
    setSelectedImageFile(file);
    if (file) {
      // Clear any existing imageKey since we're using a new file
      setImageKey("");
    }
  };

  const handleImageUpload = (key: string) => {
    setImageKey(key);
    // Clear selected file since it's now uploaded
    setSelectedImageFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <ImageInput
        ref={imageInputRef}
        uploadMode="deferred"
        onUpload={handleImageUpload}
        onImageSelect={handleImageSelect}
      />

      <TitleInput value={title} onChange={setTitle} />
      <DescriptionInput value={description} onChange={setDescription} />
      <CategoryInput value={category} onChange={setCategory} /> 

      <ProductInput products={products} onChange={setProducts} />
      <StepsInput steps={steps} onChange={setSteps} /> 
      <NotesInput value={notes} onChange={setNotes} />

      <AccentButton type="submit" disabled={saving || !title.trim() || (!imageKey && !selectedImageFile)}>
        {saving ? "Saving…" : "Create Routine"}
      </AccentButton>
    </form>
  );
}
