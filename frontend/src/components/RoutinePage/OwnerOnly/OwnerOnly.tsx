'use client';

import { useAuth } from '@/contexts/AuthContext';
import EditButton from '../EditButton/EditButton';
import DeleteButton from '../DeleteButton/DeleteButton';

type Props = {
  routineId: string;
  imageKey: string | null;
  ownerId: string;
};

export default function OwnerOnly({ routineId, imageKey, ownerId }: Props) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  if (!userId || userId !== ownerId) return null;

  return (
    <>
      <EditButton routineId={routineId} />
      <DeleteButton routineId={routineId} imageKey={imageKey} />
    </>
  );
}
