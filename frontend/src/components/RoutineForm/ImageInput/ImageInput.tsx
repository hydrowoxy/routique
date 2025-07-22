"use client";

import { useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { supabase } from "@/lib/supabase";
import { deleteImage } from "@/utils/deleteImage";

type Props = {
  onUpload: (key: string) => void;
  existingUrl?: string | null;
  disabled?: boolean;
  maxSize?: number;
};

const SIZE_PX = 512;

const processImage = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = SIZE_PX;
      canvas.height = SIZE_PX;
      canvas
        .getContext("2d")!
        .drawImage(img, sx, sy, side, side, 0, 0, SIZE_PX, SIZE_PX);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject("Canvas toBlob failed")),
        "image/jpeg",
        0.8
      );
    };
    img.onerror = () => reject("Image load error");
    img.src = URL.createObjectURL(file);
  });

export default function ImageInput({
  onUpload,
  existingUrl = null,
  disabled = false,
  maxSize = 10 * 1024 * 1024,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(existingUrl ?? "");
  const [currentKey, setCurrentKey] = useState<string | null>(
    existingUrl ? existingUrl.split("/").pop()! : null
  );
  const originalKeyRef = useRef<string | null>(
    existingUrl ? existingUrl.split("/").pop()! : null
  );

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const pickFile = () => fileInput.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;

    if (!raw.type.startsWith("image/")) {
      setError("Only image files allowed.");
      return;
    }
    if (raw.size > maxSize) {
      setError("File too large.");
      return;
    }

    setError("");
    setUploading(true);

    console.log("[ImageInput] selected:", {
      name: raw.name,
      size: raw.size,
      type: raw.type,
    });

    try {
      const blob = await processImage(raw);
      const inferredType = raw.type?.startsWith("image/")
        ? raw.type
        : "image/jpeg";
      const fileKey = `${uuid()}.jpg`;
      const previousKey = currentKey;

      console.log("[ImageInput] uploading new file:", fileKey);
      console.log("[ImageInput] previousKey:", previousKey);
      console.log("[ImageInput] originalKeyRef:", originalKeyRef.current);

      const { error: upErr, data: upRes } = await supabase.storage
        .from("routines")
        .upload(fileKey, blob, {
          cacheControl: "3600",
          contentType: inferredType,
          upsert: false,
        });

      if (upErr) {
        console.error("[ImageInput] upload error:", upErr.message);
        throw upErr;
      }
      console.log("[ImageInput] upload success:", upRes);

      if (
        previousKey &&
        previousKey !== fileKey &&
        previousKey !== originalKeyRef.current
      ) {
        console.log("[ImageInput] deleting previousKey:", previousKey);
        const { error: delErr } = await deleteImage(previousKey);
        if (delErr) {
          const msg = typeof delErr === "string" ? delErr : delErr.message;
          console.warn("[ImageInput] deleteImage error:", msg);
        } else {
          console.log("[ImageInput] deleteImage success for:", previousKey);
        }
      } else {
        console.log("[ImageInput] skipping delete. Conditions not met.");
      }

      const { data } = supabase.storage.from("routines").getPublicUrl(fileKey);
      console.log("[ImageInput] public URL:", data?.publicUrl);

      setCurrentKey(fileKey);
      setPreview(data?.publicUrl ?? "");
      onUpload(fileKey);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Upload failed";
      console.error("[ImageInput] upload failed:", msg);
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    console.log("[ImageInput] remove clicked");
    if (currentKey && currentKey !== originalKeyRef.current) {
      console.log("[ImageInput] attempting to delete:", currentKey);
      const { error: delErr } = await deleteImage(currentKey);
        if (delErr) {
          const msg = typeof delErr === "string" ? delErr : delErr.message;
          console.warn("[ImageInput] deleteImage error:", msg);
        } else {
          console.log("[ImageInput] deleteImage success for:", currentKey);
        }
    } else {
      console.log(
        "[ImageInput] skipping delete on remove. Conditions not met."
      );
    }

    setPreview("");
    setCurrentKey(null);
    onUpload("");
  };

  return (
    <div>
      {preview ? (
        <div>
          <img src={preview} alt="preview" style={{ maxWidth: 200 }} />
          <button
            type="button"
            onClick={remove}
            disabled={disabled || uploading}
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pickFile}
          disabled={disabled || uploading}
        >
          {uploading ? "Uploading…" : "Choose image"}
        </button>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />

      {error && <p style={{ color: "red", fontSize: "0.85rem" }}>{error}</p>}
    </div>
  );
}
