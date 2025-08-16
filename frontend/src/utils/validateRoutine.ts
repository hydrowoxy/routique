export type Product = { name: string; links: string[] };

export interface RoutinePayload {
  title: string;
  description: string;
  notes: string;
  imagePath: string;
  imageFile?: File; // used to validate file size
  products: Product[];
}

export interface ValidationResult {
  ok: boolean;
  msg?: string;
  data?: {
    cleanedProducts: Product[];
  };
}

export function validateRoutine(input: RoutinePayload): ValidationResult {
  const MAX_TITLE_LEN = 100;
  const MAX_DESC_LEN = 500;
  const MAX_NOTES_LEN = 2000;

  const MAX_PRODUCTS = 10;
  const MAX_LINKS = 3;
  const MAX_LINK_LEN = 500;

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  // --- Required fields ---
  if (!input.title.trim()) return { ok: false, msg: "Title is required." };
  if (!input.description.trim()) return { ok: false, msg: "Description is required." };
  if (!input.notes.trim()) return { ok: false, msg: "Notes are required." };
  if (!input.imagePath) return { ok: false, msg: "Please upload an image." };

  // --- Length limits ---
  if (input.title.length > MAX_TITLE_LEN) {
    return { ok: false, msg: `Title is too long (max ${MAX_TITLE_LEN} characters).` };
  }
  if (input.description.length > MAX_DESC_LEN) {
    return { ok: false, msg: `Description is too long (max ${MAX_DESC_LEN} characters).` };
  }
  if (input.notes.length > MAX_NOTES_LEN) {
    return { ok: false, msg: `Notes are too long (max ${MAX_NOTES_LEN} characters).` };
  }

  // --- Image size check ---
  if (input.imageFile && input.imageFile.size > MAX_IMAGE_SIZE) {
    return { ok: false, msg: "Image is too large (max 5MB)." };
  }

  // --- Product limits ---
  if (input.products.length > MAX_PRODUCTS) {
    return { ok: false, msg: `Maximum ${MAX_PRODUCTS} products allowed.` };
  }

  // --- Clean + validate products ---
  const cleanedProducts: Product[] = input.products
    .map(p => ({
      name: p.name.trim(),
      links: p.links.map(l => l.trim()).filter(Boolean),
    }))
    .filter(p => p.name || p.links.length); // drop fully empty ones

  // Ensure at least one product has something
  if (cleanedProducts.length === 0) {
    return { ok: false, msg: "Please add at least one product with content." };
  }

  const productNames = cleanedProducts.map(p => p.name.toLowerCase());
  if (new Set(productNames).size !== productNames.length) {
    return { ok: false, msg: "Each product must have a unique name." };
  }

  for (const p of cleanedProducts) {
    if (p.links.length > MAX_LINKS) {
      return {
        ok: false,
        msg: `Product "${p.name || "(unnamed)"}" has too many links (max ${MAX_LINKS}).`,
      };
    }

    const linkSet = new Set(p.links);
    if (linkSet.size !== p.links.length) {
      return {
        ok: false,
        msg: `Product "${p.name || "(unnamed)"}" has duplicate links.`,
      };
    }

    for (const link of p.links) {
      if (link.length > MAX_LINK_LEN) {
        return {
          ok: false,
          msg: `A link in "${p.name || "(unnamed)"}" is too long (max ${MAX_LINK_LEN} characters).`,
        };
      }
    }
  }

  return {
    ok: true,
    data: {
      cleanedProducts,
    },
  };
}
