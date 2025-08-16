"use client";

import React from "react";
import styles from "./Input.module.scss";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  disabled?: boolean;
  className?: string;
};

export default function Input({
  value,
  onChange,
  placeholder,
  textarea,
  rows = 3,
  disabled,
  className,
}: Props) {
  if (textarea) {
    return (
      <textarea
        className={`${styles.field} ${styles.textarea} ${className ?? ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
    );
  }

  return (
    <input
      className={`${styles.field} ${className ?? ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
