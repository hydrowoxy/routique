'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import EditButton from '../EditButton/EditButton';
import DeleteButton from '../DeleteButton/DeleteButton';

type Props = {
  routineId: string;
  imageKey: string | null;
  ownerId: string;
};

export default function OwnerOnly({ routineId, imageKey, ownerId }: Props) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    };
    fetchUser();
  }, []);

  if (userId !== ownerId) return null;

  return (
    <>
      <EditButton routineId={routineId} />
      <DeleteButton routineId={routineId} imageKey={imageKey} />
    </>
  );
}
