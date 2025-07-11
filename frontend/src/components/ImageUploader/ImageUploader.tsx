'use client';

import { useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { supabase } from '@/lib/supabase';

type Props = {
  /** Callback gets public URL (or empty string on remove) */
  onUpload: (url: string) => void;
  existingUrl?: string | null;
  disabled?: boolean;
  maxSize?: number; // bytes – default 2 MB
};

export default function ImageUploader({
  onUpload,
  existingUrl = null,
  disabled = false,
  maxSize = 2 * 1024 * 1024
}: Readonly<Props>) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(existingUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pickFile = () => fileInput.current?.click();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files allowed.');
      return;
    }
    if (file.size > maxSize) {
      setError(`File too large (>${(maxSize / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }
    setError('');
    setPreview(URL.createObjectURL(file));          

    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${uuid()}.${ext}`;

    const { error: upErr } = await supabase
      .storage
      .from('routines')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('routines').getPublicUrl(filePath);
    onUpload(data.publicUrl);
    setUploading(false);
  }

  const remove = () => {
    setPreview(null);
    onUpload('');
  };

  return (
    <div>
      {preview ? (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" width={160} height={160} style={{ objectFit: 'cover' }} />
          <button type="button" onClick={remove} disabled={disabled || uploading}>
            Remove
          </button>
        </div>
      ) : (
        <button type="button" onClick={pickFile} disabled={disabled || uploading}>
          {uploading ? 'Uploading…' : 'Choose image'}
        </button>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}
    </div>
  );
}
