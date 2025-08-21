"use client";

import Input from "@/components/Input/Input";
import styles from "./TitleInput.module.scss";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function TitleInput({ value, onChange, disabled = false }: Props) {
  return (
    <div className={styles.wrapper}>
      <Input
        value={value}
        onChange={onChange}
        placeholder="Routine Name"
        disabled={disabled}
      />
    </div>
  );
}
