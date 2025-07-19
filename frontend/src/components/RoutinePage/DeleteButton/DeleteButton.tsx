'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { deleteImage } from '@/utils/deleteImage'; 
import { useState } from 'react';

type Props = {
    routineId: string;
    imageKey?: string | null; 
};

export default function DeleteButton({ routineId, imageKey }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        console.log('[DeleteButton] handleDelete called');
        const confirmed = window.confirm(
            "Are you sure you want to delete this routine? This action is irreversible."
        );
        console.log('[DeleteButton] User confirmed:', confirmed);
        if (!confirmed) return;

        setLoading(true);
        console.log('[DeleteButton] setLoading(true)');

        try {
            console.log('[DeleteButton] Attempting to delete routine with id:', routineId);
            const { error: deleteError } = await supabase
                .from('routines')
                .delete()
                .eq('id', routineId);

            console.log('[DeleteButton] supabase delete result:', deleteError);

            if (deleteError) {
                console.error('[DeleteButton] Error deleting routine:', deleteError);
                throw deleteError;
            }

            if (imageKey) {
                console.log('[DeleteButton] Attempting to delete image with key:', imageKey);
                const { error: imageError } = await deleteImage(imageKey);
                console.log('[DeleteButton] deleteImage result:', imageError);
                if (imageError) console.warn("[DeleteButton] Image deletion failed:", imageError.message);
            } else {
                console.log('[DeleteButton] No imageKey provided, skipping image deletion');
            }

            alert("Routine deleted successfully.");

            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.username) {
                router.push(`/${user.user_metadata.username}`);
            } else {
                router.push('/');
            }
        } catch (err) {
            console.error('[DeleteButton] Failed to delete routine:', err?.message || err);
            alert('Failed to delete. See console.');
        } finally {
            setLoading(false);
            console.log('[DeleteButton] setLoading(false)');
        }
    };

    console.log('[DeleteButton] Rendered with props:', { routineId, imageKey, loading });

    return (
        <button onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
        </button>
    );
}
