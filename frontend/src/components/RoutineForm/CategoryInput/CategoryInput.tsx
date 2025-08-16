"use client";

import { CATEGORIES } from "@/lib/categories";
import styles from "./CategoryInput.module.scss";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function CategoryInput({ value, onChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.selectWrapper}>
        <select
          id="category"
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
