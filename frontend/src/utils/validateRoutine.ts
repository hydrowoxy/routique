import { checkContentProfanity } from './profanityFilter'; 

export type Product = { name: string; links: string[] };
export type Step = { step_no: number; body: string };

export interface RoutinePayload {
  title: string;
  description: string;
  notes: string;
  imagePath: string;
  imageFile?: File; // used to validate file size
  products: Product[];
  steps: Step[];
}

export interface ValidationResult {
  ok: boolean;
  msg?: string;
  data?: {
    cleanedProducts: Product[];
    cleanedSteps: Step[];
  };
}

// URL validation using the cleaner approach
const SHORTENERS = new Set([
  "bit.ly",
  "t.co",
  "tinyurl.com",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rebrand.ly",
  "lnkd.in",
]);

// BLACKLISTED SITES - Add inappropriate/harmful sites here
const BLACKLISTED_SITES = new Set([
  // Adult/Porn sites (MindGeek and others)
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "redtube.com",
  "youporn.com",
  "tube8.com",
  "spankbang.com",
  "xhamster.com",
  "chaturbate.com",
  "cam4.com",
  "livejasmin.com",
  "stripchat.com",
  "onlyfans.com",
  "manyvids.com",
  "clips4sale.com",
  
  // Gambling sites
  "bet365.com",
  "888casino.com",
  "pokerstars.com",
  "draftkings.com",
  "fanduel.com",
  
  // Crypto/MLM scams (common ones)
  "binance.com",
  "coinbase.com",
  "crypto.com",
  
  // Sketchy marketplaces
  "wish.com",
  "aliexpress.com",
  "dhgate.com",
  
  // File sharing/piracy
  "mediafire.com",
  "mega.nz",
  "rapidshare.com",
  "4shared.com",
  
  // Add more as needed...
]);

const MAX_URL_LEN = 2048;

export type LinkRisk = "known" | "unknown" | "blocked";

const KNOWN_OK = new Set([
  "sephora.com",
  "sephora.ca",
  "ulta.com",
  "amazon.com",
  "nyxcosmetics.com",
  "glossier.com",
  "target.com",
  "walmart.com",
  "cvs.com",
  "walgreens.com",
  "beautybay.com",
  "lookfantastic.com",
  "dermstore.com",
  "skinstore.com",
  "nordstrom.com",
  "macys.com",
  "sally.com",
  "sallybeauty.com",
  "beautylish.com",
  "spacenk.com",
  "cultbeauty.com",
  "feelunique.com",
  "boots.com",
  "superdrug.com",
  // add more over time; used only to reduce warning friction, not to block others
]);

function isIpHost(host: string): boolean {
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  // IPv6 like [::1]
  if (host.startsWith("[") && host.endsWith("]")) return true;
  return false;
}

function apex(host: string): string {
  const h = host.toLowerCase();
  const parts = h.split(".");
  if (parts.length < 2) return h;
  return parts.slice(-2).join(".");
}

export function validateHttpsUrl(
  raw: string
): { ok: true; url: URL; risk: LinkRisk } | { ok: false; reason: string } {
  if (!raw) return { ok: false, reason: "Empty URL" };
  if (raw.length > MAX_URL_LEN) return { ok: false, reason: "URL too long" };

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, reason: "Malformed URL" };
  }

  if (u.protocol !== "https:") return { ok: false, reason: "HTTPS required" };
  if (!u.hostname) return { ok: false, reason: "Missing host" };
  if (!u.hostname.includes(".")) return { ok: false, reason: "Host must include a TLD" };
  if (u.username || u.password) return { ok: false, reason: "Credentials in URL not allowed" };
  if (u.port) return { ok: false, reason: "Custom ports not allowed" };
  if (isIpHost(u.hostname)) return { ok: false, reason: "IP addresses are not allowed" };

  // classify
  const hostApex = apex(u.hostname);
  
  // CHECK BLACKLIST FIRST
  if (BLACKLISTED_SITES.has(hostApex)) {
    return { ok: false, reason: "This site is not allowed" };
  }
  
  if (SHORTENERS.has(hostApex)) return { ok: false, reason: "URL shorteners are not allowed" };

  const risk: LinkRisk = KNOWN_OK.has(hostApex) ? "known" : "unknown";
  return { ok: true, url: u, risk };
}

export function validateRoutine(input: RoutinePayload): ValidationResult {
  const MAX_TITLE_LEN = 100;
  const MAX_DESC_LEN = 750;
  const MAX_NOTES_LEN = 1000;

  const MAX_PRODUCTS = 10;
  const MAX_LINKS = 3;
  const MAX_LINK_LEN = 500;

  // Steps validation limits
  const MAX_STEPS = 15;
  const MAX_STEP_BODY_LEN = 500;

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  // --- Required fields ---
  if (!input.title.trim()) return { ok: false, msg: "Title is required." };
  if (!input.description.trim()) return { ok: false, msg: "Description is required." };
  if (!input.notes.trim()) return { ok: false, msg: "Notes are required." };
  if (!input.imagePath) return { ok: false, msg: "Please upload an image." };

  // --- Profanity check (early check before processing) - FIXED: renamed variables ---
  const steps = input.steps || [];
  const products = input.products || [];
  
  console.log('Raw steps data:', steps); // Debug log
  console.log('Raw products data:', products); // Debug log
  
  // Extract step bodies and product names with better filtering
  const stepBodies = steps
    .map((s) => s?.body?.trim()) // Safely access body and trim
    .filter((body) => body && body.length > 0); // Only include non-empty bodies
    
  const profanityProductNames = products // RENAMED: to avoid conflict
    .map((p) => p?.name?.trim()) // Safely access name and trim
    .filter((name) => name && name.length > 0); // Only include non-empty names
  
  console.log('Extracted step bodies:', stepBodies); // Debug log
  console.log('Extracted product names:', profanityProductNames); // Debug log
  
  const profanityCheck = checkContentProfanity({
    title: input.title,
    description: input.description,
    notes: input.notes,
    productNames: profanityProductNames, // UPDATED: use renamed variable
    stepBodies: stepBodies,
  });

  if (profanityCheck.hasProfanity) {
    return {
      ok: false,
      msg: `Content contains inappropriate language in ${profanityCheck.field}. Please revise and try again.`,
    };
  }

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

  // --- Steps validation ---
  if (steps.length > MAX_STEPS) {
    return { ok: false, msg: `Maximum ${MAX_STEPS} steps allowed.` };
  }

  // Clean and validate steps
  const cleanedSteps: Step[] = steps
    .map((step, index) => ({
      step_no: index + 1, // Renumber steps to be consecutive
      body: step.body.trim(),
    }))
    .filter((step) => step.body.length > 0); // Remove empty steps

  // Validate individual step length
  for (const step of cleanedSteps) {
    if (step.body.length > MAX_STEP_BODY_LEN) {
      return {
        ok: false,
        msg: `Step ${step.step_no} is too long (max ${MAX_STEP_BODY_LEN} characters).`,
      };
    }
  }

  // --- Product limits ---
  if (products.length > MAX_PRODUCTS) {
    return { ok: false, msg: `Maximum ${MAX_PRODUCTS} products allowed.` };
  }

  // --- Clean + validate products ---
  const cleanedProducts: Product[] = products
    .map((p) => ({
      name: p.name.trim(),
      links: p.links.map((l) => l.trim()).filter(Boolean),
    }))
    .filter((p) => p.name || p.links.length); // drop fully empty ones

  // Ensure at least one product has something
  if (cleanedProducts.length === 0) {
    return { ok: false, msg: "Please add at least one product with content." };
  }

  // KEPT ORIGINAL: This productNames variable is different (for duplicate checking)
  const productNames = cleanedProducts.map((p) => p.name.toLowerCase());
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

      const urlValidation = validateHttpsUrl(link);
      if (!urlValidation.ok) {
        return {
          ok: false,
          msg: `Invalid URL in "${p.name || "(unnamed)"}": ${urlValidation.reason}`,
        };
      }
    }
  }

  return {
    ok: true,
    data: {
      cleanedProducts,
      cleanedSteps,
    },
  };
}