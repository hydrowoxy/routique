"use client";

import Input from "@/components/Input/Input";
import styles from "./DescriptionInput.module.scss";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function DescriptionInput({ value, onChange, disabled = false }: Props) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>Description</label>
      <Input
        textarea
        rows={5}
        value={value}
        onChange={onChange}
        placeholder="Routine Description"
        disabled={disabled}
      />
    </div>
  );
}
