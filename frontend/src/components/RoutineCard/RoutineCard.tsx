'use client';

import Link from 'next/link';
import type { Database } from '@/lib/database.types';
import styles from './RoutineCard.module.scss';

type Routine = Database['public']['Tables']['routines']['Row'];

type Props = {
  routine: Pick<Routine, 'id' | 'title' | 'user_id' | 'image_path' | 'category'>;
  username?: string | null;    
  showUsername?: boolean;       // toggle display, defaults true
};

export default function RoutineCard({ routine, username, showUsername = true }: Props) {
  const imageUrl = routine.image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/routines/${routine.image_path}`
    : null;

  return (
    <div className={styles.wrapper}>
      <Link href={`/routine/${routine.id}`} className={styles.card}>
        <article>
          {imageUrl && <img src={imageUrl} alt={routine.title} className={styles.image} />}
          <div className={styles.info}>
            <h2 className={styles.title}>{routine.title}</h2>
            {routine.category && <p className={styles.category}>{routine.category}</p>}
          </div>
        </article>
      </Link>

      {showUsername && username && (
        <p className={styles.username}>@{username}</p>
      )}
    </div>
  );
}
