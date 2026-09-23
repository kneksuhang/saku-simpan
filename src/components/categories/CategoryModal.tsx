import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Category } from "../../types";
import { IconifyIcon } from "../common/IconifyIcon";
import { Search, Check } from "lucide-react";
import { COLOR_CANCEL } from "../../theme/dentoIro";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (catData: Omit<Category, "id" | "createdAt">) => void;
  initialCategory?: Category | null;
}

const PRESET_ICONS = [
  "lucide:laptop",
  "lucide:smartphone",
  "lucide:shirt",
  "lucide:briefcase",
  "lucide:home",
  "lucide:gamepad-2",
  "lucide:headphones",
  "lucide:camera",
  "lucide:book-open",
  "lucide:coffee",
  "lucide:utensils",
  "lucide:car",
  "lucide:watch",
  "lucide:wrench",
  "lucide:heart",
  "lucide:gift",
  "lucide:shopping-bag",
  "lucide:music",
  "lucide:dumbbell",
  "lucide:palette",
];

const PRESET_COLORS = [
  "#E64A19", // Shu-iro
  "#D94126", // Hi-iro
  "#F2B705", // Yamabuki-iro
  "#3B7A57", // Tokiwa-iro
  "#005F73", // Ruri-iro
  "#51A8DD", // Gunjyo-iro
  "#8B5FBF", // Fuji-iro
  "#7A5C43", // Kurumi-iro
  "#9E2A2B", // Beni-iro
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCategory,
}) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("lucide:folder");
  const [color, setColor] = useState("#E64A19");
  const [iconSearch, setIconSearch] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setIcon(initialCategory.icon || "lucide:folder");
      setColor(initialCategory.color || "#E64A19");
    } else {
      setName("");
      setIcon("lucide:laptop");
      setColor("#E64A19");
    }
    setIconSearch("");
    setSearchResults([]);
    setNameError("");
  }, [initialCategory, isOpen]);

  // Live Iconify API Search
  useEffect(() => {
    if (!iconSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(
        `https://api.iconify.design/search?query=${encodeURIComponent(iconSearch.trim())}&limit=24`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.icons)) {
            setSearchResults(data.icons);
          } else {
            setSearchResults([]);
          }
        })
        .catch(() => {
          setSearchResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [iconSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Nama kategori wajib diisi");
      return;
    }

    onSave({
      name: name.trim(),
      icon: icon || "lucide:folder",
      color,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title={initialCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Kategori */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-cat-name"
            className="text-xs font-bold uppercase tracking-wider text-(--text-primary)"
          >
            Nama Kategori <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-cat-name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            className="w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-2.5 text-sm text-(--text-primary)  focus:border-(--accent-color) focus:outline-none"
          />
          {nameError && (
            <p className="text-xs text-rose-500 font-medium">{nameError}</p>
          )}
        </div>

        {/* Live Icon Preview & Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">
              Ikon Kategori
            </label>
            {/* Live Preview badge */}
            <div className="flex items-center gap-2 rounded-lg border border-(--border-color) bg-(--bg-main) px-2.5 py-1">
              <span className="text-xs text-(--text-muted)">Pratinjau:</span>
              <IconifyIcon icon={icon} size={20} color={color} />
              <span className="text-xs font-mono font-bold text-(--text-primary)">
                {icon}
              </span>
            </div>
          </div>

          {/* Search Input for Iconify */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-(--text-muted)" />
            <input
              id="input-iconify-search"
              type="text"
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              placeholder="Pencarian..."
              className="w-full rounded-xl border border-(--border-color) bg-(--bg-card) py-2 pl-9 pr-3 text-xs text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
            />
            {isSearching && (
              <span className="absolute right-3 top-2 text-[11px] text-(--text-muted) animate-pulse">
                Mencari...
              </span>
            )}
          </div>

          {/* Icon Search Results or Preset Icons */}
          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3">
            <p className="text-[11px] font-semibold text-(--text-muted) mb-2">
              {searchResults.length > 0
                ? "Hasil:"
                : "Ikon Populer:"}
            </p>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1">
              {(searchResults.length > 0 ? searchResults : PRESET_ICONS).map(
                (ic) => {
                  const isSelected = icon === ic;
                  return (
                    <button
                      key={ic}
                      type="button"
                      title={ic}
                      onClick={() => setIcon(ic)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                        isSelected
                          ? "border-(--accent-color) bg-(--accent-soft) ring-2 ring-(--accent-color)"
                          : "border-(--border-color) bg-(--bg-card) hover:border-(--accent-color)"
                      }`}
                    >
                      <IconifyIcon
                        icon={ic}
                        size={20}
                        color={isSelected ? color : "currentColor"}
                      />
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* Warna Kategori (Dento-iro) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">
            Warna Aksen Kategori
          </label>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="relative h-7 w-7 rounded-full transition hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <Check className="w-4 h-4 text-white drop-shadow-xs" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-(--border-color)">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-white transition"
            style={{ backgroundColor: COLOR_CANCEL }}
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-90 transition"
            style={{ backgroundColor: "var(--accent-color)" }}
          >
            {initialCategory ? "Simpan Perubahan" : "Tambah Kategori"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
