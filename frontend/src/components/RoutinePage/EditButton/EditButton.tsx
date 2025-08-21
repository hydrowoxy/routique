'use client';

import Button from '@/components/Button/Button';

type Props = {
  routineId: string;
};

export default function EditButton({ routineId }: Props) {
  return (
    <Button
      type="button"
      onClick={() => {
        window.location.href = `/routine/${routineId}/edit`;
      }}
    >
      Edit
    </Button>
  );
}
