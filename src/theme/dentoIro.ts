import {
  DentoIroColor,
  DentoIroGroupKey,
  ThemeMode,
  CustomTextColors,
} from "../types";

export interface DentoGroupInfo {
  key: DentoIroGroupKey;
  name: string;
  japanese: string;
  description: string;
  colors: DentoIroColor[];
}

export const DENTO_IRO_GROUPS: DentoGroupInfo[] = [
  {
    key: "aka",
    name: "Aka-iro",
    japanese: "赤色 (Rumpun Merah)",
    description: "Energi, keberuntungan dan ketegasan tradisional Jepang",
    colors: [
      {
        id: "shu-iro",
        name: "Shu-iro (朱色)",
        hex: "#E64A19",
        group: "aka",
        mode: "light",
        meaning: "Merah cinnabar murni",
      },
      {
        id: "hi-iro",
        name: "Hi-iro (緋色)",
        hex: "#D94126",
        group: "aka",
        mode: "light",
        meaning: "Merah api berkilau",
      },
      {
        id: "momo-iro",
        name: "Momo-iro (桃花色)",
        hex: "#F596AA",
        group: "aka",
        mode: "light",
        meaning: "Bunga persik musim semi",
      },
      {
        id: "beni-iro",
        name: "Beni-iro (紅花色)",
        hex: "#9E2A2B",
        group: "aka",
        mode: "dark",
        meaning: "Merah karthamus klasik",
      },
      {
        id: "kakitsubata-iro",
        name: "Kakitsubata-iro (燕子花色)",
        hex: "#802021",
        group: "aka",
        mode: "dark",
        meaning: "Merah marun pekat",
      },
      {
        id: "bengara-iro",
        name: "Bengara-iro (弁柄色)",
        hex: "#B8403D",
        group: "aka",
        mode: "dark",
        meaning: "Oksida besi tanah",
      },
    ],
  },
  {
    key: "ki",
    name: "Ki-iro",
    japanese: "黄色 (Rumpun Kuning)",
    description: "Kehangatan padi, cahaya emas, dan kegembiraan alami",
    colors: [
      {
        id: "yamabuki-iro",
        name: "Yamabuki-iro (山吹色)",
        hex: "#F2B705",
        group: "ki",
        mode: "light",
        meaning: "Kuning mawar emas Jepang",
      },
      {
        id: "ukon-iro",
        name: "Ukon-iro (鬱金色)",
        hex: "#E69B3A",
        group: "ki",
        mode: "light",
        meaning: "Kuning kunyit hangat",
      },
      {
        id: "nanohana-iro",
        name: "Nanohana-iro (菜の花色)",
        hex: "#FCEBB6",
        group: "ki",
        mode: "light",
        meaning: "Bunga sesawi mekar",
      },
      {
        id: "kihada-iro",
        name: "Kihada-iro (黄檗色)",
        hex: "#C5A059",
        group: "ki",
        mode: "dark",
        meaning: "Kuning kulit amur cork",
      },
      {
        id: "kuwa-iro",
        name: "Kuwa-iro (桑色)",
        hex: "#A88038",
        group: "ki",
        mode: "dark",
        meaning: "Kuning daun murbei",
      },
      {
        id: "kihada-neon",
        name: "Kihada-neon (黄檗燦)",
        hex: "#D4A345",
        group: "ki",
        mode: "dark",
        meaning: "Kuning emas bercahaya",
      },
    ],
  },
  {
    key: "midori",
    name: "Midori-iro",
    japanese: "緑色 (Rumpun Hijau)",
    description: "Kesejukan pinus, lumut taman zen, dan ketenangan abadi",
    colors: [
      {
        id: "matsuba-iro",
        name: "Matsuba-iro (松葉色)",
        hex: "#4A5D4E",
        group: "midori",
        mode: "light",
        meaning: "Jarum pinus tua",
      },
      {
        id: "tokiwa-iro",
        name: "Tokiwa-iro (常盤色)",
        hex: "#3B7A57",
        group: "midori",
        mode: "light",
        meaning: "Cemara hijau abadi",
      },
      {
        id: "moegi-iro",
        name: "Moegi-iro (萌黄)",
        hex: "#8A9955",
        group: "midori",
        mode: "light",
        meaning: "Tunas muda awal semi",
      },
      {
        id: "uguisu-iro",
        name: "Uguisu-iro (鴬色)",
        hex: "#78866B",
        group: "midori",
        mode: "dark",
        meaning: "Burung bulbul Jepang",
      },
      {
        id: "fukuchitose-iro",
        name: "Fukuchitose-iro (深千歳)",
        hex: "#244235",
        group: "midori",
        mode: "dark",
        meaning: "Hutan pinus purba",
      },
      {
        id: "chitose-midori",
        name: "Chitose-midori (千歳緑)",
        hex: "#4A6B53",
        group: "midori",
        mode: "dark",
        meaning: "Ribuan tahun kehijauan",
      },
    ],
  },
  {
    key: "ao",
    name: "Ao-iro",
    japanese: "青色 (Rumpun Biru)",
    description: "Kedalaman laut samudra dan jernihnya langit fajar",
    colors: [
      {
        id: "ruri-iro",
        name: "Ruri-iro (瑠璃色)",
        hex: "#005F73",
        group: "ao",
        mode: "light",
        meaning: "Permata lapis lazuli",
      },
      {
        id: "gunjyo-iro",
        name: "Gunjyō-iro (群青色)",
        hex: "#51A8DD",
        group: "ao",
        mode: "light",
        meaning: "Biru ultramarine halus",
      },
      {
        id: "sora-iro",
        name: "Sora-iro (空色)",
        hex: "#A0D8EF",
        group: "ao",
        mode: "light",
        meaning: "Biru cerah langit siang",
      },
      {
        id: "ai-iro",
        name: "Ai-iro (藍色)",
        hex: "#0A2F5C",
        group: "ao",
        mode: "dark",
        meaning: "Indigo klasik tenun",
      },
      {
        id: "kachitsu-iro",
        name: "Kachitsu-iro (勝色)",
        hex: "#1E3F52",
        group: "ao",
        mode: "dark",
        meaning: "Biru kemenangan samurai",
      },
      {
        id: "asagi-fukai",
        name: "Asagi-fukai (深浅葱)",
        hex: "#4682B4",
        group: "ao",
        mode: "dark",
        meaning: "Biru bawang daun malam",
      },
    ],
  },
  {
    key: "murasaki",
    name: "Murasaki-iro",
    japanese: "紫色 (Rumpun Ungu)",
    description: "Keanggunan bangsawan istana Heian dan bunga wisteria",
    colors: [
      {
        id: "fuji-iro",
        name: "Fuji-iro (藤色)",
        hex: "#8B5FBF",
        group: "murasaki",
        mode: "light",
        meaning: "Bunga wisteria anggun",
      },
      {
        id: "kyo-murasaki",
        name: "Kyō-murasaki (京紫)",
        hex: "#77428D",
        group: "murasaki",
        mode: "light",
        meaning: "Ungu aristokrat Kyoto",
      },
      {
        id: "ayamame-iro",
        name: "Ayamame-iro (菖蒲色)",
        hex: "#D2B4DE",
        group: "murasaki",
        mode: "light",
        meaning: "Kelopak iris mekar",
      },
      {
        id: "shikon",
        name: "Shikon (紫紺)",
        hex: "#4A2840",
        group: "murasaki",
        mode: "dark",
        meaning: "Akar gromwell pekat",
      },
      {
        id: "kuroki-murasaki",
        name: "Kuroki-murasaki (黒樹紫)",
        hex: "#311B38",
        group: "murasaki",
        mode: "dark",
        meaning: "Ungu kayu malam",
      },
      {
        id: "edo-murasaki",
        name: "Edo-murasaki (江戸紫)",
        hex: "#5D3F6A",
        group: "murasaki",
        mode: "dark",
        meaning: "Ungu semarak kota Edo",
      },
    ],
  },
  {
    key: "cha",
    name: "Cha-iro",
    japanese: "茶色 (Rumpun Cokelat)",
    description: "Filosofi wabi-sabi upacara teh, kayu jati, dan tanah subur",
    colors: [
      {
        id: "kurumi-iro",
        name: "Kurumi-iro (胡桃色)",
        hex: "#7A5C43",
        group: "cha",
        mode: "light",
        meaning: "Kulit buah kenari",
      },
      {
        id: "kitsune-iro",
        name: "Kitsune-iro (狐色)",
        hex: "#E5AA7A",
        group: "cha",
        mode: "light",
        meaning: "Bulu rubah kecokelatan",
      },
      {
        id: "wabi-cha",
        name: "Wabi-cha (侘茶)",
        hex: "#8B7E74",
        group: "cha",
        mode: "light",
        meaning: "Teh kesederhanaan zen",
      },
      {
        id: "rikyu-cha",
        name: "Rikyu-cha (利休茶)",
        hex: "#554D31",
        group: "cha",
        mode: "dark",
        meaning: "Warna teh Sen no Rikyu",
      },
      {
        id: "sabitsuji-iro",
        name: "Sabitsuji-iro (錆辻色)",
        hex: "#3D312A",
        group: "cha",
        mode: "dark",
        meaning: "Cokelat karat antik",
      },
      {
        id: "kogane-cha",
        name: "Kogane-cha (黄金茶)",
        hex: "#655447",
        group: "cha",
        mode: "dark",
        meaning: "Teh rempah keemasan",
      },
    ],
  },
  {
    key: "musaishoku",
    name: "Musaishoku",
    japanese: "無彩色 (Rumpun Netral/Abu-abu)",
    description: "Nuansa tinta sumi kaligrafi, perak, dan kesunyian batu alam",
    colors: [
      {
        id: "sumi-usui",
        name: "Sumi-usui (薄墨色)",
        hex: "#696464",
        group: "musaishoku",
        mode: "light",
        meaning: "Tinta sumi tipis",
      },
      {
        id: "gin-iro",
        name: "Gin-iro (銀色)",
        hex: "#706E6B",
        group: "musaishoku",
        mode: "light",
        meaning: "Perak kusam antik",
      },
      {
        id: "karasu-ba",
        name: "Karasu-ba (烏羽色)",
        hex: "#595857",
        group: "musaishoku",
        mode: "light",
        meaning: "Sayap gagak berkilau",
      },
      {
        id: "kuro-tobi",
        name: "Kuro-tobi (黒鳶)",
        hex: "#464543",
        group: "musaishoku",
        mode: "dark",
        meaning: "Bulu elang gelap",
      },
      {
        id: "sumi-koku",
        name: "Sumi-koku (濃墨)",
        hex: "#3C3B3A",
        group: "musaishoku",
        mode: "dark",
        meaning: "Tinta kaligrafi pekat",
      },
      {
        id: "shikkoku",
        name: "Shikkoku (漆黒)",
        hex: "#2D2B2A",
        group: "musaishoku",
        mode: "dark",
        meaning: "Pernis hitam lacquerware",
      },
    ],
  },
];

export const DENTO_THEME_BASE = {
  light: {
    bg: "#F9F6F0", // Gofun-iro
    card: "#FFFFFF", // Putih bersih
    text: "#1C1B1A", // Sumi-iro
    textMuted: "#6E6C69", // Abu tinta sedang
    border: "#E4E2DD", // Shironezu
    skeleton: "#EDEDE9", // Shironezu pucat
    accentDefault: "#E64A19", // Shu-iro
  },
  dark: {
    bg: "#1C1B1A", // Sumi-iro
    card: "#252423", // Binshirō
    text: "#F3F3F2", // Shinjū-iro
    textMuted: "#9B9996", // Abu mutiara redup
    border: "#3A3938", // Dobunezumi
    skeleton: "#2E2D2C", // Dobunezumi gelap
    accentDefault: "#9E2A2B", // Beni-iro
  },
};

export const COLOR_DANGER = "#D9381C"; // Aka-Beni absolut
export const COLOR_CANCEL = "#959490"; // Netral Shironezu gelap

// WCAG AA & Color Math Helpers
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num) || clean.length !== 6) {
    return { r: 28, g: 27, b: 26 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export function optimizeHexForWcagAA(
  textHex: string,
  bgHex: string,
  minRatio: number = 4.6,
): string {
  let currentRatio = calculateContrastRatio(textHex, bgHex);
  if (currentRatio >= minRatio) return textHex;

  const bgRgb = hexToRgb(bgHex);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const isBgLight = bgLum > 0.5;

  const textRgb = hexToRgb(textHex);

  for (let step = 0; step < 80; step++) {
    if (isBgLight) {
      textRgb.r = Math.max(0, textRgb.r - 4);
      textRgb.g = Math.max(0, textRgb.g - 4);
      textRgb.b = Math.max(0, textRgb.b - 4);
    } else {
      textRgb.r = Math.min(255, textRgb.r + 4);
      textRgb.g = Math.min(255, textRgb.g + 4);
      textRgb.b = Math.min(255, textRgb.b + 4);
    }
    const candidate = rgbToHex(textRgb.r, textRgb.g, textRgb.b);
    if (calculateContrastRatio(candidate, bgHex) >= minRatio) {
      return candidate;
    }
  }
  return isBgLight ? "#1A1A1A" : "#F5F5F5";
}

export function applyThemeToDocument(
  mode: ThemeMode,
  accentHex: string,
  customTextColors?: CustomTextColors,
) {
  let isDark = mode === "dark";
  if (mode === "system") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  const palette = isDark ? DENTO_THEME_BASE.dark : DENTO_THEME_BASE.light;

  const primaryText = customTextColors?.primary || palette.text;
  const mutedText = customTextColors?.muted || palette.textMuted;

  root.style.setProperty("--bg-main", palette.bg);
  root.style.setProperty("--bg-card", palette.card);
  root.style.setProperty("--text-primary", primaryText);
  root.style.setProperty("--text-muted", mutedText);
  root.style.setProperty("--border-color", palette.border);
  root.style.setProperty("--skeleton-color", palette.skeleton);
  root.style.setProperty("--accent-color", accentHex);
  root.style.setProperty("--accent-soft", `${accentHex}20`);

  // Update meta theme-color for browser tab and PWA mobile status bar
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", palette.bg);
  }
}
