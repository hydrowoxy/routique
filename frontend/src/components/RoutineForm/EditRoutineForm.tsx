"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

import TitleInput       from "./TitleInput/TitleInput";
import DescriptionInput from "./DescriptionInput/DescriptionInput";
import NotesInput       from "./NotesInput/NotesInput";
import ProductInput     from "./ProductInput/ProductInput";
import ImageInput       from "./ImageInput/ImageInput";
import CategoryInput    from "./CategoryInput/CategoryInput"; 
import Loading          from "../Loading/Loading";

import { validateRoutine } from "@/utils/validateRoutine";
import { deleteImage }     from "@/utils/deleteImage";

import styles from "./RoutineForm.module.scss";
import AccentButton from "../AccentButton/AccentButton";
import Button from "../Button/Button";

type Product = { name: string; links: string[] };

export default function EditRoutineForm({ routineId }: { routineId: string }) {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");
  const [success,  setSuccess]  = useState(false);
  const [authed,   setAuthed]   = useState(false);

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [notes,       setNotes]       = useState("");
  const [products,    setProducts]    = useState<Product[]>([]);
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
      const { data, error } = await supabase
        .from("routines")
        .select("*")
        .eq("id", routineId)
        .single();

      if (cancelled) return;

      if (error || !data || data.user_id !== session!.user!.id) {
        router.push("/404");
        return;                        
      }

      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setNotes(data.notes ?? "");
      setProducts(
        (data.products || []).map((p: Product) => ({
          name: p.name ?? "",
          links: [...(p.links || [])],
        }))
      );
      setCategory(data.category ?? ""); 

      if (data.image_path) {
        originalKeyRef.current = data.image_path;
        setImageKey(data.image_path);

        const { data: urlData } = supabase.storage
          .from("routines")
          .getPublicUrl(data.image_path);
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
    setErr(""); setSuccess(false);

    console.log("Submitting with imageKey:", imageKey); 

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
      console.warn("Validation failed:", check.msg); 
      return setErr(check.msg!);
    }

    const { cleanedProducts } = check.data!;
    setSaving(true);

    const { error } = await supabase
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

    setSaving(false);
    if (error) return setErr(error.message);

    if (originalKeyRef.current && originalKeyRef.current !== imageKey) {
      console.log("Deleting replaced image:", originalKeyRef.current); 
      await deleteImage(originalKeyRef.current);
    }

    setSuccess(true);
    setTimeout(() => router.push(`/routine/${routineId}`), 1000);
  };

  if (authLoading || !authed || loading) return <Loading />;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {success && <p style={{ color: "green" }}>Saved. Redirecting…</p>}
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
      <TitleInput       value={title}       onChange={setTitle} />
      <DescriptionInput value={description} onChange={setDescription} />
      <CategoryInput    value={category}    onChange={setCategory} /> 

      <ProductInput products={products} onChange={updateProducts} />
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
