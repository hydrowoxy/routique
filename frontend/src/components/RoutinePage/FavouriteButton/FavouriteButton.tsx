'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AccentButton from '@/components/AccentButton/AccentButton';

export default function FavouriteButton({
  routineId,
  onFavouritesChange = () => {},
}: {
  routineId: string;
  onFavouritesChange?: (delta: number) => void;
}) {
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = (await supabase.auth.getSession()).data.session?.user;
      if (!user) return;

      const { data } = await supabase
        .from('favourites')
        .select('id')
        .eq('user_id', user.id)
        .eq('routine_id', routineId)
        .maybeSingle();

      setIsFavourite(!!data);
    };
    load();
  }, [routineId]);

  const toggleFavourite = async () => {
    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) {
      alert('You must be logged in to favourite this routine.');
      return;
    }

    setLoading(true);
    try {
      if (isFavourite) {
        const { error } = await supabase
          .from('favourites')
          .delete()
          .eq('user_id', user.id)
          .eq('routine_id', routineId);
        if (error) throw error;
        onFavouritesChange(-1);
      } else {
        const { error } = await supabase
          .from('favourites')
          .insert({ user_id: user.id, routine_id: routineId });
        if (error) throw error;
        onFavouritesChange(1);
      }
      setIsFavourite(!isFavourite);
    } catch (err) {
      console.error('[favourite toggle]', err);
      alert('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <AccentButton
      type="button"
      onClick={toggleFavourite}
      disabled={loading}
      aria-pressed={isFavourite}
    >
      {isFavourite ? 'Added to Boutique' : 'Add to Boutique'}
    </AccentButton>
  );
}
