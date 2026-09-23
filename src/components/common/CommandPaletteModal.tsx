import React, { useState, useEffect, useRef, useMemo } from "react";
import { Product, Category, Tag, ActiveTab, ThemeMode } from "../../types";
import { formatRupiah } from "../../utils/format";
import {
  Search,
  Plus,
  BarChart3,
  Package,
  FolderTree,
  Tags,
  Settings,
  Sun,
  Moon,
  Lock,
  Download,
  ArrowRight,
  X,
} from "lucide-react";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddProduct: () => void;
  onToggleTheme: () => void;
  themeMode: ThemeMode;
  onLockApp?: () => void;
  isPinEnabled: boolean;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAddProduct,
  onToggleTheme,
  themeMode,
  onLockApp,
  isPinEnabled,
  products,
  onSelectProduct,
  onExportJSON,
  onExportCSV,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static commands list
  const staticCommands = useMemo(() => {
    return [
      {
        id: "add-product",
        title: "Tambah Produk Wishlist Baru",
        category: "Aksi Cepat",
        shortcut: "Ctrl+N",
        icon: Plus,
        action: () => {
          onClose();
          onOpenAddProduct();
        },
      },
      {
        id: "nav-products",
        title: "Navigasi: Daftar Produk Wishlist",
        category: "Navigasi",
        shortcut: "1",
        icon: Package,
        action: () => {
          onClose();
          onNavigate("produk");
        },
      },
      {
        id: "nav-stats",
        title: "Navigasi: Statistik & Analisis Finansial",
        category: "Navigasi",
        shortcut: "2",
        icon: BarChart3,
        action: () => {
          onClose();
          onNavigate("statistik");
        },
      },
      {
        id: "nav-categories",
        title: "Navigasi: Manajemen Kategori",
        category: "Navigasi",
        shortcut: "3",
        icon: FolderTree,
        action: () => {
          onClose();
          onNavigate("kategori");
        },
      },
      {
        id: "nav-tags",
        title: "Navigasi: Label & Tag",
        category: "Navigasi",
        shortcut: "4",
        icon: Tags,
        action: () => {
          onClose();
          onNavigate("tag");
        },
      },
      {
        id: "nav-settings",
        title: "Navigasi: Pengaturan & Kustomisasi",
        category: "Navigasi",
        shortcut: "5",
        icon: Settings,
        action: () => {
          onClose();
          onNavigate("pengaturan");
        },
      },
      {
        id: "toggle-theme",
        title: `Ganti Tema ke ${themeMode === "light" ? "Mode Gelap (Kuroneko)" : "Mode Terang (Washi)"}`,
        category: "Tampilan",
        shortcut: "T",
        icon: themeMode === "light" ? Moon : Sun,
        action: () => {
          onClose();
          onToggleTheme();
        },
      },
      ...(isPinEnabled && onLockApp
        ? [
            {
              id: "lock-app",
              title: "Kunci Aplikasi Sekarang (Proteksi PIN)",
              category: "Keamanan",
              shortcut: "L",
              icon: Lock,
              action: () => {
                onClose();
                onLockApp();
              },
            },
          ]
        : []),
      ...(onExportCSV
        ? [
            {
              id: "export-csv",
              title: "Ekspor Data Wishlist ke CSV",
              category: "Ekspor",
              shortcut: "",
              icon: Download,
              action: () => {
                onClose();
                onExportCSV();
              },
            },
          ]
        : []),
      ...(onExportJSON
        ? [
            {
              id: "export-json",
              title: "Ekspor Cadangan Berkas JSON Lengkap",
              category: "Ekspor",
              shortcut: "",
              icon: Download,
              action: () => {
                onClose();
                onExportJSON();
              },
            },
          ]
        : []),
    ];
  }, [
    themeMode,
    isPinEnabled,
    onNavigate,
    onOpenAddProduct,
    onToggleTheme,
    onLockApp,
    onExportCSV,
    onExportJSON,
    onClose,
  ]);

  // Matching commands + matched products
  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return staticCommands;
    return staticCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }, [query, staticCommands]);

  const matchedProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))),
      )
      .slice(0, 5);
  }, [query, products]);

  // Combined items for keyboard navigation
  const totalItemsCount = filteredCommands.length + matchedProducts.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < totalItemsCount ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 >= 0 ? prev - 1 : Math.max(0, totalItemsCount - 1),
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex < filteredCommands.length) {
        filteredCommands[selectedIndex]?.action();
      } else {
        const prodIndex = selectedIndex - filteredCommands.length;
        const prod = matchedProducts[prodIndex];
        if (prod) {
          onClose();
          onSelectProduct(prod);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-(--border-color) bg-(--bg-card) shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-(--border-color) px-4 py-3.5 bg-(--bg-card)">
          <Search className="w-5 h-5 text-(--text-muted) shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik perintah atau cari nama produk wishlist... (↑↓ untuk navigasi, Enter pilih)"
            className="w-full bg-transparent text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="rounded border border-(--border-color) bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-(--text-muted)">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-(--text-muted) hover:text-(--text-primary)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div ref={listRef} className="max-h-96 overflow-y-auto p-2 space-y-1">
          {/* Matched Products Group (if any) */}
          {matchedProducts.length > 0 && (
            <div className="mb-2">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-(--text-muted) block">
                Produk Ditemukan ({matchedProducts.length})
              </span>
              {matchedProducts.map((prod, idx) => {
                const itemIndex = filteredCommands.length + idx;
                const isSelected = selectedIndex === itemIndex;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectProduct(prod);
                    }}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition ${
                      isSelected
                        ? "bg-(--accent-soft) text-(--accent-color)"
                        : "text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-(--text-muted)" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">
                          {prod.name}
                        </p>
                        <p className="text-[11px] font-num text-(--accent-color)">
                          {formatRupiah(prod.price)}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-(--text-muted) shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Commands Group */}
          {filteredCommands.length > 0 ? (
            <div>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-(--text-muted) block">
                Perintah &amp; Aksi
              </span>
              {filteredCommands.map((cmd, idx) => {
                const isSelected = selectedIndex === idx;
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                      isSelected
                        ? "bg-(--accent-soft) text-(--accent-color)"
                        : "text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg ${isSelected ? "bg-(--accent-color) text-white" : "bg-black/5 dark:bg-white/10 text-(--text-muted)"}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold block truncate">
                          {cmd.title}
                        </span>
                        <span className="text-[10px] text-(--text-muted)">
                          {cmd.category}
                        </span>
                      </div>
                    </div>

                    {cmd.shortcut && (
                      <kbd className="rounded border border-(--border-color) bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-(--text-muted) shrink-0">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            matchedProducts.length === 0 && (
              <div className="text-center py-8 text-(--text-muted)">
                <p className="text-xs">
                  Tidak ada perintah atau produk yang cocok dengan &quot;{query}
                  &quot;
                </p>
              </div>
            )
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between border-t border-(--border-color) px-4 py-2 bg-black/2 dark:bg-white/2 text-[11px] text-(--text-muted)">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="border border-(--border-color) bg-black/5 dark:bg-white/10 px-1 rounded">
                ↑
              </kbd>
              <kbd className="border border-(--border-color) bg-black/5 dark:bg-white/10 px-1 rounded">
                ↓
              </kbd>
              <span>navigasi</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="border border-(--border-color) bg-black/5 dark:bg-white/10 px-1 rounded">
                ↵
              </kbd>
              <span>pilih</span>
            </span>
          </div>
          <span className="flex items-center gap-1 font-mono">
            <span>Shortcut: </span>
            <kbd className="border border-(--border-color) bg-black/5 dark:bg-white/10 px-1 rounded">
              Ctrl+K
            </kbd>
          </span>
        </div>
      </div>
    </div>
  );
};
