export type OwnershipStatus = "wishlist" | "saving" | "purchased";

export interface ProductLink {
  id: string;
  url: string;
  label?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId?: string;
  tags: string[];
  url?: string;
  links?: ProductLink[];
  imageUrl?: string;
  description?: string;
  ownershipStatus?: OwnershipStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Iconify icon identifier, e.g. 'lucide:laptop', 'lucide:shirt'
  color?: string;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string; // Dento-iro hex code
  createdAt: number;
}

export type ThemeMode = "light" | "dark" | "system";

export interface CustomTextColors {
  primary?: string;
  muted?: string;
}

export type DentoIroGroupKey =
  | "aka"
  | "ki"
  | "midori"
  | "ao"
  | "murasaki"
  | "cha"
  | "musaishoku";

export interface DentoIroColor {
  id: string;
  name: string;
  hex: string;
  group: DentoIroGroupKey;
  mode: "light" | "dark" | "both";
  meaning?: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  lastSync?: number;
}

export interface PinConfig {
  enabled: boolean;
  pin: string; // 4-6 digits
  isLocked: boolean;
}

export type ActiveTab =
  | "statistics"
  | "products"
  | "categories"
  | "tags"
  | "settings"
  | "statistik"
  | "produk"
  | "kategori"
  | "tag"
  | "pengaturan";
