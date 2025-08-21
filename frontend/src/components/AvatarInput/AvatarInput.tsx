"use client";

import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { supabase } from "@/lib/supabase";
import styles from "./AvatarInput.module.scss";

type Props = {
  /** REQUIRED: used to prefix keys so RLS allows the upload */
  userId: string;

  /** Called with relative key "userId/xxxx.jpg" or "" if removed */
  onUpload: (key: string) => void;

  /** Optional preview URL for an existing avatar */
  existingUrl?: string | null;

  /** Optional existing *relative* key (preferred if you have it) */
  existingKey?: string | null;

  disabled?: boolean;
  /** Max source file size before processing (default 5MB) */
  maxSize?: number;
  /** Size of the circle (px) */
  sizePx?: number;
};

const BUCKET = "avatars";
const OUTPUT_PX = 512;

/** Crop to square & resize -> JPEG blob */
const processImage = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_PX;
      canvas.height = OUTPUT_PX;
      canvas.getContext("2d")!.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_PX, OUTPUT_PX);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject("Canvas toBlob failed")),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => reject("Image load error");
    img.src = URL.createObjectURL(file);
  });

/** Best-effort: derive storage key from a public URL */
function keyFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const marker = "/storage/v1/object/public/avatars/";
    const i = u.pathname.indexOf(marker);
    if (i === -1) return null;
    return decodeURIComponent(u.pathname.slice(i + marker.length));
  } catch {
    return null;
  }
}

/** Safe delete with error handling */
async function safeDeleteAvatar(key: string) {
  try {
    const { error } = await supabase.storage.from(BUCKET).remove([key]);
    if (error) {
      console.warn(`Failed to delete avatar ${key}:`, error);
    }
  } catch (err) {
    console.warn(`Failed to delete avatar ${key}:`, err);
  }
}

export default function AvatarInput({
  userId,
  onUpload,
  existingUrl = null,
  existingKey = null,
  disabled = false,
  maxSize = 5 * 1024 * 1024,
  sizePx,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  // Establish the "original" key, so we only delete temp uploads (not the one in DB)
  const initialKey = existingKey ?? keyFromPublicUrl(existingUrl);

  const [preview, setPreview] = useState(existingUrl ?? "");
  const [currentKey, setCurrentKey] = useState<string | null>(initialKey);
  const originalKeyRef = useRef<string | null>(initialKey);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  /** Keep internal state in sync if parent changes existingUrl/existingKey later */
  useEffect(() => {
    const nextKey = existingKey ?? keyFromPublicUrl(existingUrl);
    originalKeyRef.current = nextKey ?? null;
    setCurrentKey(nextKey ?? null);

    if (existingUrl) {
      // parent gave us a url already
      setPreview(existingUrl);
    } else if (nextKey) {
      // create a public url from key
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(nextKey);
      setPreview(data?.publicUrl || "");
    } else {
      setPreview("");
    }
  }, [existingUrl, existingKey]);

  const pickFile = () => fileInput.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;

    if (!userId) {
      setError("Not logged in.");
      return;
    }
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

    try {
      const blob = await processImage(raw);
      const fileKey = `${userId}/${uuid()}.jpg`; // rls
      const prevKey = currentKey;

      const { error: upErr } = await supabase
        .storage
        .from(BUCKET)
        .upload(fileKey, blob, {
          cacheControl: "3600",
          contentType: "image/jpeg",
          upsert: false,
        });

      if (upErr) throw upErr;

      // Delete the previous avatar (both temp uploads AND the original)
      // This ensures old avatars are cleaned up when user changes their profile picture
      if (prevKey && prevKey !== fileKey) {
        await safeDeleteAvatar(prevKey);
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileKey);
      setCurrentKey(fileKey);
      setPreview(data?.publicUrl ?? "");
      onUpload(fileKey);
      
      // Update the original key reference to the new one
      originalKeyRef.current = fileKey;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Upload failed";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (e?: React.MouseEvent) => {
    // prevent opening the file picker when clicking the remove pill
    e?.stopPropagation();

    if (currentKey) {
      await safeDeleteAvatar(currentKey);
    }
    setPreview("");
    setCurrentKey(null);
    originalKeyRef.current = null;
    onUpload(""); // tell parent to clear profile.avatar_path
  };

  return (
    <div
      className={styles.wrapper}
      style={
        sizePx
          ? ({ ["--avatar-input-size" as string]: `${sizePx}px` } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className={styles.box}
        role="button"
        aria-label="Choose avatar"
        onClick={!disabled && !uploading ? pickFile : undefined}
      >
        {!preview ? (
          <>
            <img className={styles.icon} src="/icons/camera.svg" alt="" />
            {uploading && (
              <span style={{ position: "absolute", bottom: 8, fontSize: 12 }}>
                Uploading…
              </span>
            )}
          </>
        ) : (
          <>
            <img className={styles.preview} src={preview} alt="Avatar preview" />
            <button
              type="button"
              className={styles.remove}
              onClick={remove}
              disabled={disabled || uploading}
            >
              remove
            </button>
          </>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />

      {error && (
        <p className={styles.error} aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
