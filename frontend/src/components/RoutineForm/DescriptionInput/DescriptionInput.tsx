'use client';

import { ChangeEvent } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function DescriptionInput({ value, onChange, disabled = false }: Props) {
  return (
    <textarea
      placeholder="Description"
      value={value}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
}
