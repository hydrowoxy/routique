'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { deleteRoutine } from '@/utils/deleteRoutine';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Button from '@/components/Button/Button';

type Props = {
  routineId: string;
  imageKey?: string | null; // Can remove this since deleteRoutine handles it
};

export default function DeleteButton({ routineId }: Props) {
  const router = useRouter();
  const { session } = useAuth();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this routine? This action is irreversible.'
    );
    if (!confirmed) return;

    if (!session?.user?.id) {
      showError('You must be logged in to delete routines');
      return;
    }

    setLoading(true);
    try {
      const { error } = await deleteRoutine(routineId, session.user.id);

      if (error) {
        throw error;
      }

      showSuccess('Routine deleted successfully');

      // Redirect to profile
      const username = session.user.user_metadata?.username;
      router.push(username ? `/${username}` : '/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[DeleteButton] Failed to delete:', msg);
      showError('Failed to delete routine. Please try again.');
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
