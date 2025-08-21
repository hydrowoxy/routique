export const CATEGORIES = [
  "Skincare", "Makeup", "Hair", "Nail", "Fragrance",
  "Morning", "Night", "Stress", "Glow-up", "Bath/shower",
  "Oral care", "Shaving", "Body", "Sleep", "Post-workout",
  "Outfit", "Seasonal", "Trend",
  "Pre-date", "Travel", "Party", "Everyday",
  "Cosplay", "Halloween",
  "Celebrity-inspired", "K-beauty", "Coquette", "E-girl", "Soft goth", "Unique", "Viral",
] as const;

export type Category = (typeof CATEGORIES)[number];