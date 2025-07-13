'use client';

import { useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { supabase } from '@/lib/supabase';

type Props = {
  onUpload: (path: string) => void; 
  existingUrl?: string | null;
  disabled?: boolean;
  maxSize?: number;
};

export default function ImageInput({
  onUpload,
  existingUrl = null,
  disabled = false,
  maxSize = 2 * 1024 * 1024,
}: Readonly<Props>) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(existingUrl || '');
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
    setUploading(true);

    const ext = file.name.split('.').pop();
    const filePath = `${uuid()}.${ext}`;

    const { error: uploadErr } = await supabase
      .storage
      .from('routines')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('routines').getPublicUrl(filePath);
    setPreview(data.publicUrl);       
    onUpload(filePath);                

    setUploading(false);
  }

  const remove = () => {
    setPreview('');
    onUpload('');
  };

  return (
    <div>
      {preview ? (
        <div>
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
