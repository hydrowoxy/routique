'use client';

type Product = {
  name: string;
  links: string[];
};

type Props = {
  products: Product[];
  onChange: (products: Product[]) => void;
};

export default function ProductInput({ products, onChange }: Props) {
  const addProduct = () => {
    onChange([...products, { name: '', links: [''] }]);
  };

  const updateProduct = (index: number, updated: Product) => {
    const newList = [...products];
    newList[index] = updated;
    onChange(newList);
  };

  const removeProduct = (index: number) => {
    const newList = products.filter((_, i) => i !== index);
    onChange(newList);
  };

  return (
    <div>
      {products.map((product, i) => (
        <div key={i}>
          <input
            type="text"
            placeholder="Product name"
            value={product.name}
            onChange={(e) =>
              updateProduct(i, { ...product, name: e.target.value })
            }
          />
          {product.links.map((link, j) => (
            <input
              key={j}
              type="text"
              placeholder="Product link"
              value={link}
              onChange={(e) => {
                const newLinks = [...product.links];
                newLinks[j] = e.target.value;
                updateProduct(i, { ...product, links: newLinks });
              }}
            />
          ))}
          <button
            type="button"
            onClick={() =>
              updateProduct(i, {
                ...product,
                links: [...product.links, ''],
              })
            }
          >
            + Link
          </button>
          <button type="button" onClick={() => removeProduct(i)}>
            Remove Product
          </button>
        </div>
      ))}
      <button type="button" onClick={addProduct}>
        + Product
      </button>
    </div>
  );
}
