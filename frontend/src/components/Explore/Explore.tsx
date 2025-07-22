'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import RoutineCard from '@/components/RoutineCard/RoutineCard';
import { useAuth } from '@/contexts/AuthContext'; 
import styles from './Explore.module.scss';
import type { Database } from '@/lib/database.types';
import Loading from '@/components/Loading/Loading';

type Routine = Pick<
  Database['public']['Tables']['routines']['Row'],
  'id' | 'title' | 'description' | 'image_path' | 'tags' | 'favourite_count' | 'view_count' | 'user_id'
>;

export default function Explore() {
  const { loading: authLoading } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from('routines')
        .select('id, title, description, image_path, tags, favourite_count, view_count, user_id');

      if (error) {
        console.error('[Explore] Failed to fetch routines:', error);
        setRoutines([]);
      } else {
        setRoutines(data ?? []);
      }
    } catch (err) {
      console.error('[Explore] Unexpected error:', err);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchRoutines();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchRoutines();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [authLoading]);

  return (
    <div>
      <h2 className={styles.heading}>Explore Routines</h2>
      {loading || authLoading ? (
        <Loading />
      ) : (
        <div className={styles.grid}>
          {routines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </div>
      )}
    </div>
  );
}
