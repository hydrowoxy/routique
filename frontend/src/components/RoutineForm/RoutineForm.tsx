"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

import TitleInput from "./TitleInput/TitleInput";
import DescriptionInput from "./DescriptionInput/DescriptionInput";
import NotesInput from "./NotesInput/NotesInput";
import TagInput from "./TagInput/TagInput";
import ProductInput from "./ProductInput/ProductInput";
import ImageInput from "./ImageInput/ImageInput";
import Loading from "../Loading/Loading";

import { useRouter } from "next/navigation";

import { validateRoutine } from "@/utils/validateRoutine";

type Product = { name: string; links: string[] };

export default function RoutineForm() {
  const { session, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [imagePath, setImagePath] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !session?.user) {
      router.push("/login");
    }
  }, [authLoading, session, router]);

  if (authLoading || !session?.user) {
    return <Loading />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSuccess(false);

    const result = validateRoutine({
      title,
      description,
      notes,
      tagsRaw: tags,
      imagePath,
      products,
    });

    if (!result.ok) {
      setErr(result.msg!);
      return;
    }

    const { cleanedProducts, cleanedTags } = result.data!;
    setSaving(true);

    const { error } = await supabase.from("routines").insert({
      id: crypto.randomUUID(),
      user_id: session.user.id,
      title: title.trim(),
      description: description.trim(),
      image_path: imagePath,
      view_count: 0,
      favourite_count: 0,
      tags: cleanedTags,
      products: cleanedProducts,
      notes: notes.trim(),
    });

    setSaving(false);

    if (error) {
      setErr(error.message);
    } else {
      setSuccess(true);
      setTitle("");
      setDescription("");
      setNotes("");
      setTags("");
      setProducts([]);
      setImagePath("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Routine</h2>
      {success && <p style={{ color: "green" }}>Routine created ✔️</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}
      <TitleInput value={title} onChange={setTitle} />
      <DescriptionInput value={description} onChange={setDescription} />
      <ImageInput onUpload={setImagePath} existingUrl={imagePath} />
      <ProductInput products={products} onChange={setProducts} />
      <NotesInput value={notes} onChange={setNotes} />
      <TagInput value={tags} onChange={setTags} />
      <button type="submit" disabled={saving || !title.trim() || !imagePath}>
        {saving ? "Saving…" : "Create Routine"}
      </button>
    </form>
  );
}
