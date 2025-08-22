'use client';

import type { Database } from '@/lib/database.types';
import type { Category } from '@/lib/categories';
import styles from './CategoryCard.module.scss';

type Routine = Database['public']['Tables']['routines']['Row'];

type Props = {
  category: Category;
  routines: Routine[];
  onCategorySelect?: (category: Category) => void;
};

export default function CategoryCard({ category, routines, onCategorySelect }: Props) {
  // Get a random routine from this category for the background image
  const randomRoutine = routines.length > 0 ? routines[Math.floor(Math.random() * routines.length)] : null;
  
  const imageUrl = randomRoutine?.image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/routines/${randomRoutine.image_path}`
    : null;

  const handleClick = () => {
    if (onCategorySelect) {
      onCategorySelect(category);
    } else {
      console.warn('onCategorySelect is not provided to CategoryCard');
    }
  };

  return (
    <div className={styles.wrapper}>
      <button onClick={handleClick} className={styles.card}>
        <div 
          className={styles.imageContainer}
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundColor: imageUrl ? undefined : 'var(--accent)'
          }}
        >
          <div className={styles.overlay}>
            <div className={styles.content}>
              <p className={styles.browseText}>Browse more in</p>
              <h2 className={styles.title}>{category}</h2>
            </div>
          </div>
        </div>
      </button>
      
      <p className={styles.cta}>Explore new, fresh routines</p>
    </div>
  );
}