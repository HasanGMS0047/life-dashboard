// The app's small accent palette — pulled out of the Account page so other
// components (streak badges, etc.) can tint themselves with the user's
// favorite color too, not just the account page's own avatar ring.
export type AccentKey = "terracotta" | "olive" | "mustard" | "blush" | "sky";

export const ACCENTS: {
  key: AccentKey;
  label: string;
  swatch: string;
  border: string;
  text: string;
}[] = [
  { key: "terracotta", label: "Terracotta", swatch: "bg-terracotta", border: "border-terracotta", text: "text-terracotta" },
  { key: "olive", label: "Olive", swatch: "bg-olive", border: "border-olive", text: "text-olive" },
  { key: "mustard", label: "Mustard", swatch: "bg-mustard", border: "border-mustard", text: "text-mustard" },
  { key: "blush", label: "Blush", swatch: "bg-blush", border: "border-blush", text: "text-blush" },
  { key: "sky", label: "Sky", swatch: "bg-sky", border: "border-sky", text: "text-sky" },
];

export function accentTextClass(key: AccentKey | null | undefined): string {
  return ACCENTS.find((a) => a.key === key)?.text ?? "text-terracotta";
}
