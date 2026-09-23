export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumberWithDots(amount: number | string): string {
  const numeric =
    typeof amount === "string"
      ? parseInt(amount.replace(/\D/g, ""), 10)
      : amount;
  if (isNaN(numeric)) return "";
  return new Intl.NumberFormat("id-ID").format(numeric);
}

export function parseFormattedNumber(formatted: string): number {
  const clean = formatted.replace(/\D/g, "");
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function extractDomain(urlStr?: string): string | null {
  if (!urlStr) return null;
  try {
    let clean = urlStr.trim();
    if (!clean) return null;
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    const url = new URL(clean);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function extractDomainCleanName(urlStr?: string): string {
  const domain = extractDomain(urlStr);
  if (!domain) return "Tautan";
  const parts = domain.split(".");
  const name = parts[0] || "Tautan";
  if (name.toLowerCase() === "tokopedia") return "Tokopedia";
  if (name.toLowerCase() === "shopee") return "Shopee";
  if (name.toLowerCase() === "bukalapak") return "Bukalapak";
  if (name.toLowerCase() === "blibli") return "Blibli";
  if (name.toLowerCase() === "lazada") return "Lazada";
  if (name.toLowerCase() === "tiktok") return "TikTok Shop";
  if (name.toLowerCase() === "amazon") return "Amazon";
  if (name.toLowerCase() === "ikea") return "IKEA";
  if (name.toLowerCase() === "uniqlo") return "Uniqlo";
  if (name.toLowerCase() === "apple") return "Apple";
  if (name.toLowerCase() === "sony") return "Sony";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getFaviconUrl(urlStr?: string): string | null {
  const domain = extractDomain(urlStr);
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export function getFallbackFaviconUrl(urlStr?: string): string | null {
  const domain = extractDomain(urlStr);
  if (!domain) return null;
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}
