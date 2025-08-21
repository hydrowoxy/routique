'use client';

import { useState } from 'react';
import FavouriteButton from '@/components/RoutinePage/FavouriteButton/FavouriteButton';
import ShareButton from '@/components/RoutinePage/ShareButton/ShareButton'; // ← add
import styles from './FavouriteArea.module.scss';

export default function FavouriteArea({
  id,
  initialFavourites,
}: {
  id: string;
  initialFavourites: number | null;
}) {
  const [favourites, setFavourites] = useState(initialFavourites ?? 0);

  return (
    <section className={styles.wrap}>
      <p className={styles.meta}>
        {favourites} users added this routine to their Boutique&nbsp;
      </p>
      <div className={styles.actions}>
        <FavouriteButton
          routineId={id}
          onFavouritesChange={(delta) => setFavourites((f) => f + delta)}
        />
        <ShareButton routineId={id} />
      </div>
    </section>
  );
}
