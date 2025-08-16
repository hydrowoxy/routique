"use client";

import { useEffect } from "react";
import Input from "@/components/Input/Input";
import AccentButton from "@/components/AccentButton/AccentButton";
import Button from "@/components/Button/Button";
import styles from "./ProductInput.module.scss";

type Product = { name: string; links: string[] };

type Props = {
  products: Product[];
  onChange: (products: Product[]) => void;
};

export default function ProductInput({ products, onChange }: Props) {
  // Ensure at least one row exists
  useEffect(() => {
    if (!products || products.length === 0) {
      onChange([{ name: "", links: [""] }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addProduct = () =>
    onChange([...(products ?? []), { name: "", links: [""] }]);

  const removeProduct = (i: number) =>
    onChange(products.filter((_, idx) => idx !== i));

  const setName = (i: number, v: string) => {
    const next = [...products];
    next[i] = { ...next[i], name: v };
    onChange(next);
  };

  const setLink = (i: number, v: string) => {
    const next = [...products];
    const links = [...(next[i].links ?? [])];
    links[0] = v;
    next[i] = { ...next[i], links };
    onChange(next);
  };

  return (
    <section className={styles.wrapper}>
      <h3 className={styles.title}>Products</h3>

      <div className={styles.head}>
        <div className={styles.headCell}>Name</div>
        <div className={styles.headCell}>Link</div>
      </div>

      {(products?.length ? products : [{ name: "", links: [""] }]).map(
        (p, i) => (
          <div key={i} className={styles.rowBlock}>
            <div className={styles.row}>
              <Input
                value={p.name}
                onChange={(v) => setName(i, v)}
                placeholder="Product Name"
              />
              <Input
                value={p.links?.[0] ?? ""}
                onChange={(v) => setLink(i, v)}
                placeholder="Link"
              />
            </div>

            <div className={styles.rowActions}>
              <Button type="button" onClick={() => removeProduct(i)}>
                - remove product
              </Button>
            </div>
          </div>
        )
      )}

      <div className={styles.actions}>
        <AccentButton type="button" onClick={addProduct}>
          + add product
        </AccentButton>
      </div>
    </section>
  );
}
