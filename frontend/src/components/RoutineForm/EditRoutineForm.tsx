"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

import TitleInput from "./TitleInput/TitleInput";
import DescriptionInput from "./DescriptionInput/DescriptionInput";
import NotesInput from "./NotesInput/NotesInput";
import TagInput from "./TagInput/TagInput";
import ProductInput from "./ProductInput/ProductInput";
import ImageInput from "./ImageInput/ImageInput";
import Loading from "../Loading/Loading";

type Product = { name: string; links: string[] };

export default function EditRoutineForm({ routineId }: { routineId: string }) {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [imageKey, setImageKey] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Handle auth check and redirect
  useEffect(() => {
    if (authLoading) return;

    if (!session?.user) {
      console.log("No authenticated user, redirecting to login");
      router.push("/login");
      return;
    }

    setAuthChecked(true);
  }, [authLoading, session?.user, router]);

  // Fetch routine data only after auth is confirmed
  useEffect(() => {
    if (!authChecked || !session?.user?.id) return;

    const fetchRoutine = async () => {
      console.log("Fetching routine:", routineId);
      
      const { data, error } = await supabase
        .from("routines")
        .select("*")
        .eq("id", routineId)
        .single();

      if (error) {
        console.error("[Routine Fetch Error]", error.message);
        setErr("Failed to load routine");
        setLoading(false);
        return;
      }

      if (!data) {
        console.error("No routine found");
        router.push("/404");
        return;
      }

      if (data.user_id !== session.user.id) {
        console.error("User doesn't own this routine");
        router.push("/404");
        return;
      }

      // Populate form data with proper deep cloning for products
      setTitle(data.title || "");
      setDescription(data.description || "");
      setNotes(data.notes || "");
      setTags((data.tags || []).join(", "));
      
      // Deep clone the products array to ensure proper state updates
      const clonedProducts = (data.products || []).map((product: Product) => ({
        name: product.name || "",
        links: [...(product.links || [])] // Clone the links array
      }));
      setProducts(clonedProducts);
      
      setImageKey(data.image_path || "");

      if (data.image_path) {
        const { data: urlData } = supabase.storage
          .from("routines")
          .getPublicUrl(data.image_path);
        setPreviewUrl(urlData?.publicUrl || "");
      }

      setLoading(false);
      console.log("Routine loaded successfully");
    };

    fetchRoutine();
  }, [authChecked, session?.user?.id, routineId, router]);

  // Helper function to update products with proper immutability
  const updateProducts = (newProducts: Product[]) => {
    // Ensure we create a completely new array with new objects
    const clonedProducts = newProducts.map(product => ({
      name: product.name || "",
      links: [...(product.links || [])]
    }));
    setProducts(clonedProducts);
    console.log("Products updated:", clonedProducts);
  };
  const handleCancel = () => {
    router.push(`/routine/${routineId}`);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSuccess(false);

    if (!title.trim()) return setErr("Title is required.");
    if (!imageKey) return setErr("Please upload an image.");

    setSaving(true);

    // Filter out empty products (no name and no links)
    const filteredProducts = products.filter(
      (p) => p.name.trim() || (p.links && p.links.some((l) => l.trim()))
    );

    // Clean up the products data before saving
    const cleanedProducts = filteredProducts.map(product => ({
      name: product.name.trim(),
      links: (product.links || []).filter(link => link.trim()).map(link => link.trim())
    }));

    console.log("Saving products:", cleanedProducts);

    const { error } = await supabase
      .from("routines")
      .update({
        title: title.trim(),
        description: description.trim(),
        image_path: imageKey,
        notes: notes.trim() || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        products: cleanedProducts,
      })
      .eq("id", routineId);

    setSaving(false);

    if (error) {
      console.error("Save error:", error);
      setErr(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/routine/${routineId}`);
      }, 1000); // Small delay to show success message
    }
  };

  if (authLoading || !authChecked || loading) {
    return <Loading />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Routine</h2>
      {success && <p style={{ color: "green" }}>Saved. Redirecting to routine...</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

      <TitleInput value={title} onChange={setTitle} />
      <DescriptionInput value={description} onChange={setDescription} />
      <ImageInput
        existingUrl={previewUrl}
        onUpload={(newKey) => {
          setImageKey(newKey);
          const { data: urlData } = supabase.storage
            .from("routines")
            .getPublicUrl(newKey);
          setPreviewUrl(urlData?.publicUrl || "");
        }}
      />
      <ProductInput 
        products={products} 
        onChange={updateProducts} 
      />
      <NotesInput value={notes} onChange={setNotes} />
      <TagInput value={tags} onChange={setTags} />

      <button type="submit" disabled={saving || !title.trim() || !imageKey}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
      <button type="button" onClick={handleCancel} disabled={saving}>
        Cancel 
      </button>
    </form>
  );
}