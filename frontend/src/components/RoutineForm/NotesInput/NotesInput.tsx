"use client";

import Input from "@/components/Input/Input";
import styles from "./NotesInput.module.scss";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function NotesInput({ value, onChange, disabled = false }: Props) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Notes</label>
      <Input
        textarea
        rows={4}
        value={value}
        onChange={onChange}
        placeholder="Notes"
        disabled={disabled}
      />
    </div>
  );
}
