"use client";

import { useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { supabase } from "@/lib/supabase";
import { deleteImage } from "@/utils/deleteImage";
import styles from "./ImageInput.module.scss";

type Props = {
  onUpload: (key: string) => void;
  existingUrl?: string | null;
  disabled?: boolean;
  maxSize?: number;
  /** Optional: override box size, e.g. "140px" */
  sizePx?: number;
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
      canvas.getContext("2d")!.drawImage(
        img,
        sx,
        sy,
        side,
        side,
        0,
        0,
        SIZE_PX,
        SIZE_PX
      );

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
  sizePx,
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

    try {
      const blob = await processImage(raw);
      const inferredType = raw.type?.startsWith("image/")
        ? raw.type
        : "image/jpeg";
      const fileKey = `${uuid()}.jpg`;
      const previousKey = currentKey;

      const { error: upErr } = await supabase.storage
        .from("routines")
        .upload(fileKey, blob, {
          cacheControl: "3600",
          contentType: inferredType,
          upsert: false,
        });

      if (upErr) throw upErr;

      if (
        previousKey &&
        previousKey !== fileKey &&
        previousKey !== originalKeyRef.current
      ) {
        const { error: delErr } = await deleteImage(previousKey);
        if (delErr) {
          // non-fatal
          console.warn("[ImageInput] deleteImage error:", delErr);
        }
      }

      const { data } = supabase.storage.from("routines").getPublicUrl(fileKey);
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
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (currentKey && currentKey !== originalKeyRef.current) {
      const { error: delErr } = await deleteImage(currentKey);
      if (delErr) console.warn("[ImageInput] deleteImage error:", delErr);
    }
    setPreview("");
    setCurrentKey(null);
    onUpload("");
  };

  return (
    <div
      className={styles.wrapper}
      style={sizePx ? ({ ["--image-input-size" as string]: `${sizePx}px` } as React.CSSProperties) : undefined}
    >
      <div
        className={styles.box}
        role="button"
        aria-label="Choose image"
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
            <img className={styles.preview} src={preview} alt="Routine" />
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

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
