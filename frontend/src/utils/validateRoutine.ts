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

// URL validation helper
function isValidURL(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Must be HTTP or HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Must have a valid hostname
    if (!parsedUrl.hostname || parsedUrl.hostname.length < 3) {
      return false;
    }
    
    // Must have a proper domain (contains at least one dot)
    if (!parsedUrl.hostname.includes('.')) {
      return false;
    }

    // Check for valid TLD (top-level domain)
    const parts = parsedUrl.hostname.split('.');
    const tld = parts[parts.length - 1];
    
    // TLD must be at least 2 characters and only letters
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
      return false;
    }

    // Block common suspicious patterns
    const suspiciousPatterns = [
      /bit\.ly/i,
      /tinyurl/i,
      /t\.co/i,
      /goo\.gl/i,
      /shortened/i,
      /redirect/i,
      /malware/i,
      /virus/i,
      /phishing/i,
      /localhost/i,
      /127\.0\.0\.1/i,
      /192\.168\./i,
      /10\./i,
      /\.zip$/i,
      /\.exe$/i,
      /\.scr$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.onion$/i, // Tor hidden services
    ];
    
    const fullUrl = url.toLowerCase();
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fullUrl)) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

// Check if URL is HTTPS (for security recommendation)
function isSecureURL(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

// Basic check to see if it looks like a real domain (not just random text)
function hasValidDomainStructure(url: string): boolean {
  try {
    const parsedUrl = new URL(url.toLowerCase());
    const hostname = parsedUrl.hostname.replace('www.', '');
    
    // Split into parts
    const parts = hostname.split('.');
    
    // Must have at least 2 parts (domain.tld)
    if (parts.length < 2) {
      return false;
    }
    
    // Each part must be valid (letters, numbers, hyphens only)
    for (const part of parts) {
      if (!/^[a-zA-Z0-9-]+$/.test(part)) {
        return false;
      }
      
      // Can't start or end with hyphen
      if (part.startsWith('-') || part.endsWith('-')) {
        return false;
      }
      
      // Must have at least 1 character
      if (part.length === 0) {
        return false;
      }
    }
    
    // Domain part (before TLD) should be reasonable length
    const domain = parts[parts.length - 2];
    if (domain.length < 1 || domain.length > 63) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
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

      // --- URL validation ---
      if (!isValidURL(link)) {
        return {
          ok: false,
          msg: `Invalid URL in "${p.name || "(unnamed)"}": Please provide a valid web address starting with https://`,
        };
      }

      if (!isSecureURL(link)) {
        return {
          ok: false,
          msg: `Insecure URL in "${p.name || "(unnamed)"}": Please use HTTPS links for security. HTTP links are not allowed.`,
        };
      }

      if (!hasValidDomainStructure(link)) {
        return {
          ok: false,
          msg: `Invalid domain in "${p.name || "(unnamed)"}": Please ensure the link has a valid domain structure (e.g., example.com).`,
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