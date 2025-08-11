"use client";

import { CATEGORIES } from "@/lib/categories";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function CategoryInput({ value, onChange }: Props) {
  return (
    <div>
      <label htmlFor="category">Category</label>
      <select
        id="category"
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
  );
}
