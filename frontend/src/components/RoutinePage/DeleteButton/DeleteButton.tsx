'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { deleteImage } from '@/utils/deleteImage';
import { useState } from 'react';
import Button from '@/components/Button/Button';

type Props = {
  routineId: string;
  imageKey?: string | null;
};

// Turn a public URL into a storage key if needed.
// Example public URL: /storage/v1/object/public/routines/<KEY>
function toKey(input?: string | null): string | null {
  if (!input) return null;
  try {
    if (!input.includes('/storage/v1/object')) return input; // already a key
    const url = new URL(input, typeof window !== 'undefined' ? window.location.origin : 'https://dummy');
    const path = decodeURIComponent(url.pathname);
    const marker = '/storage/v1/object/public/routines/';
    const pos = path.indexOf(marker);
    if (pos === -1) return input;
    return path.slice(pos + marker.length);
  } catch {
    return input;
  }
}

export default function DeleteButton({ routineId, imageKey }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this routine? This action is irreversible.'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      // 1) Fetch latest image_path
      const { data: row, error: fetchErr } = await supabase
        .from('routines')
        .select('image_path')
        .eq('id', routineId)
        .single();
      if (fetchErr) throw fetchErr;

      const keyFromDb = row?.image_path ?? null;
      const key = toKey(keyFromDb ?? imageKey ?? null);

      // 2) Delete routine row
      const { error: delRowErr } = await supabase.from('routines').delete().eq('id', routineId);
      if (delRowErr) throw delRowErr;

      // 3) Best-effort: delete image
      if (key) {
        const { error: delImgErr } = await deleteImage(key);
        if (delImgErr) {
          const msg = typeof delImgErr === 'string' ? delImgErr : delImgErr.message;
          console.warn('[DeleteButton] Image deletion failed:', msg);
        }
      }

      // 4) Redirect to profile/home
      const { data: authRes } = await supabase.auth.getUser();
      const username = authRes?.user?.user_metadata?.username;
      router.push(username ? `/${username}` : '/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[DeleteButton] Failed to delete:', msg);
      alert('Failed to delete. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
