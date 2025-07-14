interface Product {
  name: string
  links?: string[]
}
export default function Products({ products }: { products: Product[] | null }) {
  if (!products || products.length === 0) return null
  return (
    <>
      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.name}>
            {p.name}
            {p.links?.map((l) => (
              <a key={l} href={l} target="_blank" rel="noopener noreferrer">
                &nbsp;🔗
              </a>
            ))}
          </li>
        ))}
      </ul>
    </>
  )
}