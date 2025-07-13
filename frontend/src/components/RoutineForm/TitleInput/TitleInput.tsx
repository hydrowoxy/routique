'use client';

import { ChangeEvent } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function TitleInput({ value, onChange, disabled = false }: Props) {
  return (
    <input
      type="text"
      placeholder="Title"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
}
