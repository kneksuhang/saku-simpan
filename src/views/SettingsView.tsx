import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  DENTO_IRO_GROUPS,
  DENTO_THEME_BASE,
  COLOR_DANGER,
  COLOR_CANCEL,
  calculateContrastRatio,
  optimizeHexForWcagAA,
} from "../theme/dentoIro";
import {
  DentoIroColor,
  DentoIroGroupKey,
  PinConfig,
  TelegramConfig,
  Product,
  Category,
  Tag,
  ThemeMode,
} from "../types";
import { formatRupiah, extractDomainCleanName } from "../utils/format";
import { ResetConfirmModal } from "../components/common/ResetConfirmModal";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import {
  Palette,
  RotateCcw,
  Sparkles,
  Lock,
  Download,
  Upload,
  Send,
  Trash2,
  Check,
  Smartphone,
  FileJson,
  FileSpreadsheet,
  FileText,
  Printer,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Sliders,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  AppWindow,
} from "lucide-react";

interface SettingsViewProps {
  currentAccentHex: string;
  onSelectAccent: (hex: string) => void;
  customTextColor?: string;
  onSelectCustomTextColor?: (hex: string | undefined) => void;
  themeMode: ThemeMode;
  pinConfig: PinConfig;
  onUpdatePinConfig: (config: PinConfig) => void;
  telegramConfig: TelegramConfig;
  onUpdateTelegramConfig: (config: TelegramConfig) => void;
  products: Product[];
  categories: Category[];
  tags: Tag[];
  onImportData: (data: {
    products?: Product[];
    categories?: Category[];
    tags?: Tag[];
  }) => Promise<void>;
  onResetAllData: () => Promise<void>;
  onResetThemeDefault?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentAccentHex,
  onSelectAccent,
  customTextColor,
  onSelectCustomTextColor,
  themeMode,
  pinConfig,
  onUpdatePinConfig,
  telegramConfig,
  onUpdateTelegramConfig,
  products,
  categories,
  tags,
  onImportData,
  onResetAllData,
  onResetThemeDefault,
}) => {
  // Active Dento-iro tab filter
  const [selectedGroup, setSelectedGroup] = useState<DentoIroGroupKey>("aka");

  // WCAG AA Text Color Customization State
  const activeBase =
    themeMode === "dark" ? DENTO_THEME_BASE.dark : DENTO_THEME_BASE.light;
  const currentBgHex = activeBase.bg;
  const defaultTextHex = activeBase.text;

  const [inputTextColor, setInputTextColor] = useState(
    customTextColor || defaultTextHex,
  );
  const [wcagSuccessMsg, setWcagSuccessMsg] = useState("");

  // Sync when theme changes
  useEffect(() => {
    if (!customTextColor) {
      setInputTextColor(defaultTextHex);
    }
  }, [themeMode, customTextColor, defaultTextHex]);

  // Contrast ratio math
  const currentContrast = useMemo(() => {
    try {
      return calculateContrastRatio(inputTextColor, currentBgHex);
    } catch {
      return 1;
    }
  }, [inputTextColor, currentBgHex]);

  const isWcagPass = currentContrast >= 4.5;

  // Auto-optimize text color for WCAG AA
  const handleAutoOptimizeWcag = () => {
    const optimized = optimizeHexForWcagAA(inputTextColor, currentBgHex, 4.5);
    setInputTextColor(optimized);
    if (onSelectCustomTextColor) {
      onSelectCustomTextColor(optimized);
    }
    setWcagSuccessMsg(
      `Warna otomatis dioptimalkan ke rasio ${calculateContrastRatio(optimized, currentBgHex).toFixed(2)}:1 (Lulus WCAG AA)`,
    );
    setTimeout(() => setWcagSuccessMsg(""), 3500);
  };

  const handleApplyCustomTextColor = () => {
    if (onSelectCustomTextColor) {
      onSelectCustomTextColor(inputTextColor);
      setWcagSuccessMsg("Warna teks berhasil diterapkan ke seluruh antarmuka");
      setTimeout(() => setWcagSuccessMsg(""), 3000);
    }
  };

  const handleResetTextColorDefault = () => {
    setInputTextColor(defaultTextHex);
    if (onSelectCustomTextColor) {
      onSelectCustomTextColor(undefined);
      setWcagSuccessMsg("Warna teks dikembalikan ke standar bawaan");
      setTimeout(() => setWcagSuccessMsg(""), 3000);
    }
  };

  // PWA Install Prompt State
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [pwaStatusMsg, setPwaStatusMsg] = useState("");

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!installPromptEvent) {
      setPwaStatusMsg(
        'Untuk menginstal di browser ini, gunakan menu browser (titik tiga atau tombol bagikan) lalu pilih "Instal Aplikasi" atau "Tambah ke Layar Utama".',
      );
      return;
    }
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === "accepted") {
      setIsAppInstalled(true);
      setPwaStatusMsg(
        "Aplikasi sAku simpan berhasil dipasang di perangkat Anda!",
      );
    }
    setInstallPromptEvent(null);
  };

  const handleClearPwaCache = async () => {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      setPwaStatusMsg("Cache PWA berhasil dibersihkan. Memuat ulang aset...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setPwaStatusMsg("Cache browser tidak mendukung API Cache.");
    }
  };

  // PIN Setup State
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [pinStep, setPinStep] = useState<"idle" | "enter" | "confirm">("idle");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");

  // Telegram state
  const [botToken, setBotToken] = useState(telegramConfig.botToken || "");
  const [chatId, setChatId] = useState(telegramConfig.chatId || "");
  const [telegramStatus, setTelegramStatus] = useState<string>("");
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);

  // Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. PIN Keypad Handler
  const handleKeypadPress = (digit: string) => {
    setPinError("");
    if (pinStep === "enter") {
      if (newPinInput.length < 6) {
        const next = newPinInput + digit;
        setNewPinInput(next);
      }
    } else if (pinStep === "confirm") {
      if (confirmPinInput.length < newPinInput.length) {
        const next = confirmPinInput + digit;
        setConfirmPinInput(next);
      }
    }
  };

  const handleKeypadDelete = () => {
    setPinError("");
    if (pinStep === "enter") {
      setNewPinInput((prev) => prev.slice(0, -1));
    } else if (pinStep === "confirm") {
      setConfirmPinInput((prev) => prev.slice(0, -1));
    }
  };

  const handleProceedToConfirmPin = () => {
    if (newPinInput.length < 4) {
      setPinError("PIN minimal terdiri dari 4 digit angka");
      return;
    }
    setPinStep("confirm");
    setConfirmPinInput("");
  };

  const handleSavePin = () => {
    if (confirmPinInput !== newPinInput) {
      setPinError("Konfirmasi PIN tidak cocok");
      return;
    }
    onUpdatePinConfig({
      enabled: true,
      pin: newPinInput,
      isLocked: false,
    });
    setPinStep("idle");
    setNewPinInput("");
    setConfirmPinInput("");
    setPinSuccess("PIN berhasil diaktifkan. Aplikasi akan terkunci otomatis.");
    setTimeout(() => setPinSuccess(""), 4000);
  };

  const handleDisablePin = () => {
    onUpdatePinConfig({
      enabled: false,
      pin: "",
      isLocked: false,
    });
    setPinStep("idle");
    setNewPinInput("");
    setConfirmPinInput("");
    setPinSuccess("PIN telah dinonaktifkan.");
    setTimeout(() => setPinSuccess(""), 3000);
  };

  // 2. Export Handlers
  const exportJSON = () => {
    const backupData = {
      version: "2.0",
      appName: "sAku simpan",
      exportedAt: new Date().toISOString(),
      products,
      categories,
      tags,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sAku-simpan-cadangan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportEXCEL = () => {
    const rows = products.map((p, index) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const linksText =
        (p.links || [])
          .map((l) => `${l.label || "Link"}: ${l.url}`)
          .join(" | ") ||
        p.url ||
        "";
      return {
        No: index + 1,
        "Nama Produk": p.name,
        "Harga (Rp)": p.price,
        "Status Barang": p.ownershipStatus || "wishlist",
        Kategori: cat?.name || "Tanpa Kategori",
        Tag: p.tags?.join(", ") || "",
        "Tautan URL": linksText,
        "URL Foto": p.imageUrl || "",
        Deskripsi: p.description || "",
        "Tanggal Dibuat": new Date(p.createdAt).toLocaleDateString("id-ID"),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Wishlist Produk");
    XLSX.writeFile(
      workbook,
      `sAku-simpan-wishlist-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const exportCSV = () => {
    const headers = [
      "No",
      "Nama Produk",
      "Harga",
      "Status Barang",
      "Kategori",
      "Tag",
      "URL",
      "Deskripsi",
      "Tanggal",
    ];
    const rows = products.map((p, index) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const linksText =
        (p.links || [])
          .map((l) => `${l.label || "Link"}: ${l.url}`)
          .join(" | ") ||
        p.url ||
        "";
      return [
        index + 1,
        `"${p.name.replace(/"/g, '""')}"`,
        p.price,
        `"${p.ownershipStatus || "wishlist"}"`,
        `"${(cat?.name || "").replace(/"/g, '""')}"`,
        `"${(p.tags?.join(", ") || "").replace(/"/g, '""')}"`,
        `"${linksText.replace(/"/g, '""')}"`,
        `"${(p.description || "").replace(/"/g, '""')}"`,
        `"${new Date(p.createdAt).toLocaleDateString("id-ID")}"`,
      ].join(",");
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sAku-simpan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const totalPrice = products.reduce((acc, curr) => acc + curr.price, 0);

    // Title
    doc.setFontSize(20);
    doc.text("sAku simpan - Daftar Wishlist", 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Dicetak pada: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}`,
      14,
      27,
    );
    doc.text(
      `Total Produk: ${products.length} item | Total Estimasi: ${formatRupiah(totalPrice)}`,
      14,
      33,
    );
    doc.line(14, 37, 196, 37);

    let y = 46;
    products.forEach((p, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${p.name}`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Harga: ${formatRupiah(p.price)} | Status: ${p.ownershipStatus || "wishlist"}`,
        14,
        y + 5,
      );

      const cat = categories.find((c) => c.id === p.categoryId);
      if (cat) {
        doc.text(`Kategori: ${cat.name}`, 120, y + 5);
      }
      if (p.tags && p.tags.length > 0) {
        doc.text(`Tag: ${p.tags.join(", ")}`, 14, y + 10);
      }
      if (p.description) {
        doc.setFontSize(9);
        const splitDesc = doc.splitTextToSize(p.description, 175);
        doc.text(splitDesc, 14, y + (p.tags?.length ? 15 : 11));
        y += splitDesc.length * 4 + 4;
      }
      y += 16;
      doc.setDrawColor(220, 220, 220);
      doc.line(14, y - 4, 196, y - 4);
    });

    doc.save(
      `sAku-simpan-wishlist-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  // Import JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.products || json.categories || json.tags) {
          await onImportData(json);
          alert("Data berhasil diimpor ke IndexedDB!");
        } else {
          alert("Format berkas JSON tidak sesuai untuk sAku simpan.");
        }
      } catch (err) {
        alert("Gagal membaca berkas JSON.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 3. Telegram Bot Handlers
  const handleSaveTelegramConfig = () => {
    onUpdateTelegramConfig({
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      enabled: Boolean(botToken.trim() && chatId.trim()),
      lastSync: Date.now(),
    });
    setTelegramStatus("Konfigurasi Telegram berhasil disimpan");
    setTimeout(() => setTelegramStatus(""), 3000);
  };

  const handleTestTelegram = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTelegramStatus("Harap masukkan Bot Token dan Chat ID Telegram");
      return;
    }
    setIsSendingTelegram(true);
    setTelegramStatus("Mengirim pesan tes ke Telegram...");
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${botToken.trim()}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId.trim(),
            text: `🔔 *sAku simpan Terhubung!*\n\nKoneksi bot Telegram berhasil terpasang ke perangkat Anda.\nTotal wishlist saat ini: ${products.length} barang.`,
            parse_mode: "Markdown",
          }),
        },
      );
      const data = await res.json();
      if (data.ok) {
        setTelegramStatus(
          "Berhasil terhubung! Periksa pesan di aplikasi Telegram Anda.",
        );
      } else {
        setTelegramStatus(
          `Gagal mengirim: ${data.description || "Token/Chat ID salah"}`,
        );
      }
    } catch {
      setTelegramStatus(
        "Gagal menghubungi API Telegram. Pastikan koneksi internet aktif.",
      );
    } finally {
      setIsSendingTelegram(false);
    }
  };

  const handleSendBackupToTelegram = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTelegramStatus(
        "Harap masukkan Bot Token dan Chat ID Telegram terlebih dahulu",
      );
      return;
    }
    setIsSendingTelegram(true);
    setTelegramStatus("Mengirim berkas JSON cadangan ke Telegram...");

    try {
      const backupData = {
        version: "2.0",
        appName: "sAku simpan",
        exportedAt: new Date().toISOString(),
        products,
        categories,
        tags,
      };
      const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const formData = new FormData();
      formData.append("chat_id", chatId.trim());
      formData.append(
        "document",
        jsonBlob,
        `sAku-simpan-cadangan-${new Date().toISOString().slice(0, 10)}.json`,
      );
      formData.append(
        "caption",
        `📁 *Cadangan Wishlist sAku simpan*\nTotal Produk: ${products.length}\nTotal Nilai: ${formatRupiah(products.reduce((a, b) => a + b.price, 0))}`,
      );

      const res = await fetch(
        `https://api.telegram.org/bot${botToken.trim()}/sendDocument`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (data.ok) {
        setTelegramStatus(
          "Berkas JSON berhasil terkirim langsung ke HP Anda via Telegram!",
        );
      } else {
        setTelegramStatus(`Gagal mengirim dokumen: ${data.description}`);
      }
    } catch {
      setTelegramStatus("Gagal mengirim berkas ke Telegram.");
    } finally {
      setIsSendingTelegram(false);
    }
  };

  return (
    <div id="settings-dashboard" className="space-y-8 animate-fade-in pb-16">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-(--text-primary)">
          Dasbor Pengaturan
        </h2>
      </div>

      {/* 1. KUSTOMISASI WARNA TEMA DENTO-IRO & RESET DEFAULT */}
      <section className="rounded-xl border border-(--border-color) bg-(--bg-card) p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-(--border-color) pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-(--accent-color)" />
            <div>
              <h3 className="text-base font-bold text-(--text-primary)">
                Warna Tema
              </h3>
            </div>
          </div>

          {/* Tombol Reset Default Warna Tema */}
          <button
            type="button"
            onClick={() => {
              if (onResetThemeDefault) {
                onResetThemeDefault();
              } else {
                onSelectAccent(activeBase.accentDefault);
              }
              handleResetTextColorDefault();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-main) px-3.5 py-1.5 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) hover:text-(--accent-color) transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Warna Tema</span>
          </button>
        </div>

        {/* Group Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-(--border-color) pb-3">
          {DENTO_IRO_GROUPS.map((grp) => {
            const isSelected = selectedGroup === grp.key;
            return (
              <button
                key={grp.key}
                type="button"
                onClick={() => setSelectedGroup(grp.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? "bg-(--accent-color) text-white shadow-xs"
                    : "text-(--text-muted) hover:text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {grp.name}
              </button>
            );
          })}
        </div>

        {/* Active Group Description & Swatches */}
        {(() => {
          const currentGroupInfo = DENTO_IRO_GROUPS.find(
            (g) => g.key === selectedGroup,
          );
          if (!currentGroupInfo) return null;
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-(--text-primary)">
                    {currentGroupInfo.japanese}
                  </h4>
                  <p className="text-xs text-(--text-muted)">
                    {currentGroupInfo.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-(--text-muted)">
                    Aksen Aktif:
                  </span>
                  <div
                    className="h-5 w-5 rounded-full border border-black/20"
                    style={{ backgroundColor: currentAccentHex }}
                  />
                  <span className="font-mono text-xs font-bold text-(--text-primary)">
                    {currentAccentHex}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {currentGroupInfo.colors.map((color) => {
                  const isCurrent =
                    currentAccentHex.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => onSelectAccent(color.hex)}
                      className={`flex flex-col items-center p-3 rounded-xl border transition text-center cursor-pointer ${
                        isCurrent
                          ? "border-(--accent-color) bg-(--accent-soft) ring-2 ring-(--accent-color)"
                          : "border-(--border-color) bg-(--bg-main) hover:border-(--accent-color)"
                      }`}
                    >
                      <div
                        className="h-9 w-9 rounded-full mb-2 flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: color.hex }}
                      >
                        {isCurrent && (
                          <Check className="w-5 h-5 text-white drop-shadow-xs" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-(--text-primary) leading-tight">
                        {color.name}
                      </span>
                      <span className="font-mono text-[11px] text-(--text-muted) mt-0.5">
                        {color.hex}
                      </span>
                      <span className="text-[10px] text-(--text-muted) italic mt-1 line-clamp-1">
                        {color.meaning}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 2. MODUL KUSTOMISASI WARNA TEKS WCAG AA LENGKAP DENGAN AUTO-OPTIMIZE */}
      <section className="rounded-xl border border-(--border-color) bg-(--bg-card) p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-(--border-color) pb-3">
          <Sliders className="w-5 h-5 text-(--accent-color)" />
          <div>
            <h3 className="text-base font-bold text-(--text-primary)">
              Warna Teks &amp; Aksesibilitas WCAG AA
            </h3>
          </div>
        </div>

        {wcagSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{wcagSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Controls & Metrics */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                Pilih Warna
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={
                    inputTextColor.startsWith("#")
                      ? inputTextColor
                      : `#${inputTextColor}`
                  }
                  onChange={(e) => setInputTextColor(e.target.value)}
                  className="h-10 w-12 rounded-xl border border-(--border-color) bg-(--bg-main) p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={inputTextColor}
                  onChange={(e) => setInputTextColor(e.target.value)}
                  placeholder="#1C1B1A"
                  className="flex-1 rounded-xl border border-(--border-color) bg-(--bg-main) px-3.5 py-2 font-mono text-xs font-bold text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
                />
              </div>
            </div>

            {/* Contrast Ratio Metric Card */}
            <div className="p-3.5 rounded-xl border border-(--border-color) bg-(--bg-main) space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-(--text-muted)">
                  Rasio Kontras:
                </span>
                <span className="font-mono text-base font-bold text-(--text-primary)">
                  {currentContrast.toFixed(2)} : 1
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-(--text-muted)">
                  Status WCAG AA:
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isWcagPass
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {isWcagPass ? "LULUS (≥ 4.5:1)" : "BELUM MEMENUHI (< 4.5:1)"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAutoOptimizeWcag}
                className="inline-flex items-center gap-1.5 rounded-xl bg-(--accent-color) px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimalkan</span>
              </button>

              <button
                type="button"
                onClick={handleApplyCustomTextColor}
                className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-card) px-3.5 py-2 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Terapkan Warna</span>
              </button>

              <button
                type="button"
                onClick={handleResetTextColorDefault}
                className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-card) px-3 py-2 text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Bawaan</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MODUL EKSPOR DATA LANJUTAN (CSV & RINGKASAN CETAK/PDF) */}
      <section className="rounded-xl border border-(--border-color) bg-(--bg-card) p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-(--border-color) pb-3">
          <Download className="w-5 h-5 text-(--accent-color)" />
          <div>
            <h3 className="text-base font-bold text-(--text-primary)">
              Ekspor &amp; Impor Data
            </h3>
          </div>
        </div>

        {/* Quick Data Summary Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-center">
            <span className="text-xs text-(--text-muted)">Total Barang</span>
            <p className="text-lg font-bold text-(--text-primary)">
              {products.length}
            </p>
          </div>
          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-center">
            <span className="text-xs text-(--text-muted)">
              Total Nilai Estimasi
            </span>
            <p className="text-sm sm:text-base font-bold text-(--accent-color)">
              {formatRupiah(products.reduce((acc, p) => acc + p.price, 0))}
            </p>
          </div>
          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-center">
            <span className="text-xs text-(--text-muted)">Total Kategori</span>
            <p className="text-lg font-bold text-(--text-primary)">
              {categories.length}
            </p>
          </div>
          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-center">
            <span className="text-xs text-(--text-muted)">Total Label Tag</span>
            <p className="text-lg font-bold text-(--text-primary)">
              {tags.length}
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-(--text-muted) block mb-2">
            Pilih Format &amp; Cetak:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <button
              type="button"
              id="btn-export-csv"
              onClick={exportCSV}
              className="flex items-center justify-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-xs font-bold text-(--text-primary) hover:border-amber-500 hover:text-amber-500 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-500" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              id="btn-export-pdf"
              onClick={exportPDF}
              className="flex items-center justify-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-xs font-bold text-(--text-primary) hover:border-rose-500 hover:text-rose-500 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-500" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              id="btn-print-summary"
              onClick={handleTriggerPrint}
              className="flex items-center justify-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-xs font-bold text-(--text-primary) hover:border-(--accent-color) hover:text-(--accent-color) transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-(--accent-color)" />
              <span>Print</span>
            </button>

            <button
              type="button"
              id="btn-export-excel"
              onClick={exportEXCEL}
              className="flex items-center justify-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-xs font-bold text-(--text-primary) hover:border-emerald-500 hover:text-emerald-500 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              id="btn-export-json"
              onClick={exportJSON}
              className="flex items-center justify-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-xs font-bold text-(--text-primary) hover:border-(--accent-color) hover:text-(--accent-color) transition cursor-pointer"
            >
              <FileJson className="w-4 h-4 text-(--accent-color)" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Import JSON */}
        <div className="pt-2 border-t border-(--border-color)">
          <span className="text-xs font-bold uppercase tracking-wider text-(--text-muted) block mb-2">
            Impor Data:
          </span>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              id="btn-import-json"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-main) px-4 py-2 text-xs font-bold text-(--text-primary) hover:border-(--accent-color) cursor-pointer"
            >
              <Upload className="w-4 h-4 text-(--accent-color)" />
              <span>Pilih File JSON</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. MODUL PWA (PROGRESSIVE WEB APP) & DUKUNGAN INSTALASI MANDIRI */}
      <section className="rounded-xl border border-(--border-color) bg-(--bg-card) p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
          <div className="flex items-center gap-2">
            <AppWindow className="w-5 h-5 text-(--accent-color)" />
            <div>
              <h3 className="text-base font-bold text-(--text-primary)">PWA</h3>
            </div>
          </div>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            PWA Ready
          </span>
        </div>

        {pwaStatusMsg && (
          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-xs text-(--text-primary)">
            {pwaStatusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-(--text-primary)">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Offline Ready</span>
            </div>
            <p className="text-[11px] text-(--text-muted)">
              Seluruh data tersimpan di browser dan dapat diakses saat offline.
            </p>
          </div>

          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-(--text-primary)">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Web App Manifest</span>
            </div>
            <p className="text-[11px] text-(--text-muted)">
              Ikon origami kantong dan tema warna otomatis terdaftar pada sistem
              operasi.
            </p>
          </div>

          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-(--text-primary)">
              <HardDrive className="w-4 h-4 text-(--accent-color)" />
              <span>Status Pemasangan</span>
            </div>
            <p className="text-[11px] text-(--text-muted)">
              {isAppInstalled
                ? "Aplikasi telah terpasang di perangkat ini."
                : "Tersedia untuk dipasang ke desktop/layar utama."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleInstallPWA}
            className="inline-flex items-center gap-2 rounded-xl bg-(--accent-color) px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-95 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>
              {isAppInstalled ? "Pasang Ulang / Panduan Instalasi" : "Install"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleClearPwaCache}
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-main) px-3.5 py-2.5 text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan PWA</span>
          </button>
        </div>
      </section>

      {/* 5. MODUL SETUP PIN (KEYPAD & OTOMATIS TERKUNCI SAAT REFRESH) */}
      <section className="rounded-xl border border-(--border-color) bg-(--bg-card) p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-(--accent-color)" />
            <div>
              <h3 className="text-base font-bold text-(--text-primary)">PIN</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                pinConfig.enabled
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-black/5 dark:bg-white/10 text-(--text-muted)"
              }`}
            >
              {pinConfig.enabled ? "PIN Aktif" : "PIN Nonaktif"}
            </span>
          </div>
        </div>

        {pinSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
            <span>{pinSuccess}</span>
          </div>
        )}

        {pinStep === "idle" ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-(--text-muted) space-y-1">
              <p>
                Status:{" "}
                <strong className="text-(--text-primary)">
                  {pinConfig.enabled
                    ? "Website terkunci"
                    : "Website tidak terkunci"}
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {pinConfig.enabled ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setPinStep("enter");
                      setNewPinInput("");
                    }}
                    className="rounded-xl border border-(--border-color) bg-(--bg-main) px-4 py-2 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) cursor-pointer"
                  >
                    Ubah PIN
                  </button>
                  <button
                    type="button"
                    onClick={handleDisablePin}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                  >
                    Nonaktifkan PIN
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPinStep("enter");
                    setNewPinInput("");
                  }}
                  className="rounded-xl bg-(--accent-color) px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition cursor-pointer"
                >
                  Aktifkan PIN Baru
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Interactive Keypad Setup Panel */
          <div className="max-w-xs mx-auto text-center space-y-4 py-2">
            <div>
              <h4 className="text-sm font-bold text-(--text-primary)">
                {pinStep === "enter"
                  ? "Masukkan PIN (4 - 6 Angka)"
                  : "Konfirmasi PIN"}
              </h4>
              <p className="text-xs text-(--text-muted) mt-0.5">
                {pinStep === "enter"
                  ? "Gunakan tombol keypad berikut"
                  : "Ketik ulang angka PIN yang sama persis"}
              </p>
            </div>

            {/* Dots */}
            <div className="flex justify-center items-center gap-3 py-2">
              {Array.from({
                length: pinStep === "enter" ? 6 : newPinInput.length,
              }).map((_, i) => {
                const isFilled =
                  pinStep === "enter"
                    ? i < newPinInput.length
                    : i < confirmPinInput.length;
                return (
                  <div
                    key={i}
                    className={`h-3.5 w-3.5 rounded-full border-2 transition ${
                      isFilled
                        ? "bg-(--accent-color) border-(--accent-color) scale-110"
                        : "border-(--border-color) bg-transparent"
                    }`}
                  />
                );
              })}
            </div>

            {pinError && (
              <p className="text-xs font-semibold text-rose-500">{pinError}</p>
            )}

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="h-12 rounded-xl border border-(--border-color) bg-(--bg-main) font-num text-lg font-bold text-(--text-primary) hover:border-(--accent-color) active:scale-95 transition cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleKeypadDelete}
                className="h-12 rounded-xl border border-(--border-color) bg-(--bg-main) text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) active:scale-95 transition cursor-pointer"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress("0")}
                className="h-12 rounded-xl border border-(--border-color) bg-(--bg-main) font-num text-lg font-bold text-(--text-primary) hover:border-(--accent-color) active:scale-95 transition cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  setPinStep("idle");
                  setNewPinInput("");
                  setConfirmPinInput("");
                }}
                className="h-12 rounded-xl border border-(--border-color) bg-(--bg-main) text-xs font-semibold text-(--text-muted) cursor-pointer"
              >
                Batal
              </button>
            </div>

            {pinStep === "enter" && newPinInput.length >= 4 && (
              <button
                type="button"
                onClick={handleProceedToConfirmPin}
                className="w-full rounded-xl bg-(--accent-color) py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-90 cursor-pointer"
              >
                Lanjut Konfirmasi PIN ({newPinInput.length} Digit)
              </button>
            )}

            {pinStep === "confirm" &&
              confirmPinInput.length === newPinInput.length && (
                <button
                  type="button"
                  onClick={handleSavePin}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  Simpan &amp; Aktifkan PIN
                </button>
              )}
          </div>
        )}
      </section>

      {/* 6. MODUL TERINTEGRASI BOT TELEGRAM TWO-WAY */}
      <section className="rounded-xl border border-(--border-color) bg-(--bg-card) p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-(--border-color) pb-3">
          <Send className="w-5 h-5 text-(--accent-color)" />
          <div>
            <h3 className="text-base font-bold text-(--text-primary)">
              Bot Telegram
            </h3>
          </div>
        </div>

        {telegramStatus && (
          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3 text-xs text-(--text-primary)">
            {telegramStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="input-tg-token"
              className="text-xs font-bold uppercase tracking-wider text-(--text-muted)"
            >
              Token Bot
            </label>
            <input
              id="input-tg-token"
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Contoh: 123456789:ABCdefGhIJKlmNoPQRst"
              className="w-full rounded-xl border border-(--border-color) bg-(--bg-main) px-3.5 py-2 text-xs font-mono text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="input-tg-chatid"
              className="text-xs font-bold uppercase tracking-wider text-(--text-muted)"
            >
              Chat ID
            </label>
            <input
              id="input-tg-chatid"
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Contoh: 987654321"
              className="w-full rounded-xl border border-(--border-color) bg-(--bg-main) px-3.5 py-2 text-xs font-mono text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveTelegramConfig}
            className="rounded-xl bg-(--accent-color) px-4 py-2 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
          >
            Simpan
          </button>
          <button
            type="button"
            disabled={isSendingTelegram}
            onClick={handleTestTelegram}
            className="rounded-xl border border-(--border-color) bg-(--bg-main) px-4 py-2 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) cursor-pointer"
          >
            Tes
          </button>
          <button
            type="button"
            disabled={isSendingTelegram}
            onClick={handleSendBackupToTelegram}
            className="rounded-xl border border-(--border-color) bg-(--bg-main) px-4 py-2 text-xs font-semibold text-(--accent-color) hover:border-(--accent-color) cursor-pointer"
          >
            Kirim File JSON
          </button>
        </div>
      </section>

      {/* 7. MODUL RESET SELURUH DATA (KONFIRMASI DUA LAPIS 'RESET') */}
      <section className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-rose-500/20 pb-3">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <div>
            <h3 className="text-base font-bold text-rose-600">
              Reset Seluruh Data (Danger Zone)
            </h3>
          </div>
        </div>

        <button
          type="button"
          id="btn-trigger-reset-all"
          onClick={() => setIsResetModalOpen(true)}
          style={{ backgroundColor: COLOR_DANGER }}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset Data</span>
        </button>
      </section>

      {/* Two-Layer Reset Modal with GSAP Horizontal Shake */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetConfirmed={onResetAllData}
      />
    </div>
  );
};
