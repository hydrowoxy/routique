import styles from "./Products.module.scss";

type Product = { name: string; links?: string[] };

// Helper function to extract domain from URL
function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove www. prefix if present
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    // Fallback if URL is malformed
    return url;
  }
}

export default function Products({ products }: { products: Product[] | null }) {
  if (!products || products.length === 0) return null;

  return (
    <section className={styles.products}>
      <h2 className={styles.title}>Products</h2>

      <div className={styles.grid} role="table" aria-label="Products">
        <div className={`${styles.row} ${styles.headerRow}`} role="row">
          <div className={styles.th} role="columnheader">Name</div>
          <div className={styles.th} role="columnheader">Link</div>
        </div>

        {products.map((p) => (
          <div key={p.name} className={styles.row} role="row">
            <div className={styles.name} role="cell" title={p.name}>
              {p.name}
            </div>
            <div className={styles.links} role="cell">
              {p.links?.length ? (
                p.links.map((l) => (
                  <a
                    key={l}
                    href={l}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                    title={l} // Show full URL on hover
                  >
                    {getDomainFromUrl(l)}
                  </a>
                ))
              ) : (
                <span className={styles.muted}>—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
