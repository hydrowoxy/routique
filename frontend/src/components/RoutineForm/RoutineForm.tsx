"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

import TitleInput from "./TitleInput/TitleInput";
import DescriptionInput from "./DescriptionInput/DescriptionInput";
import NotesInput from "./NotesInput/NotesInput";
import ProductInput from "./ProductInput/ProductInput";
import ImageInput from "./ImageInput/ImageInput";
import CategoryInput from "./CategoryInput/CategoryInput"; 
import Loading from "../Loading/Loading";

import { useRouter } from "next/navigation";
import { validateRoutine } from "@/utils/validateRoutine";

import styles from "./RoutineForm.module.scss";
import AccentButton from "../AccentButton/AccentButton";

type Product = { name: string; links: string[] };

export default function RoutineForm() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState(""); 

  const [imageKey, setImageKey] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !session?.user) {
      router.push("/login");
    }
  }, [authLoading, session, router]);

  if (authLoading || !session?.user) return <Loading />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSuccess(false);

    if (!category) {
      setErr("Please select a category.");
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
      setErr(check.msg!);
      return;
    }

    const { cleanedProducts } = check.data!;
    setSaving(true);

    const { error } = await supabase.from("routines").insert({
      id: crypto.randomUUID(),
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

    setSaving(false);

    if (error) {
      setErr(error.message);
    } else {
      setSuccess(true);
      setTitle("");
      setDescription("");
      setNotes("");
      setProducts([]);
      setCategory(""); 
      setImageKey("");
      setPreviewUrl("");

      const username = session.user.user_metadata?.username;
      if (username) {
        setTimeout(() => router.push(`/${username}`), 1000);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {success && <p style={{ color: "green" }}>Routine created. Redirecting…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

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
      <NotesInput value={notes} onChange={setNotes} />

      <AccentButton type="submit" disabled={saving || !title.trim() || !imageKey}>
        {saving ? "Saving…" : "Create Routine"}
      </AccentButton>
    </form>
  );
}
