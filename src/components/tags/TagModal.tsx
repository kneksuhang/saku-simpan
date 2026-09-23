import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Tag } from "../../types";
import { COLOR_CANCEL } from "../../theme/dentoIro";
import { Check } from "lucide-react";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tagData: Omit<Tag, "id" | "createdAt">) => void;
  initialTag?: Tag | null;
}

const TAG_COLORS = [
  { name: "Shu-iro (Merah)", hex: "#E64A19" },
  { name: "Hi-iro (Merah Terang)", hex: "#D94126" },
  { name: "Momo-iro (Merah Muda)", hex: "#F596AA" },
  { name: "Yamabuki-iro (Kuning Emas)", hex: "#F2B705" },
  { name: "Ukon-iro (Kuning Kunyit)", hex: "#E69B3A" },
  { name: "Matsuba-iro (Hijau Pinus)", hex: "#4A5D4E" },
  { name: "Tokiwa-iro (Hijau Abadi)", hex: "#3B7A57" },
  { name: "Moegi-iro (Hijau Tunas)", hex: "#8A9955" },
  { name: "Ruri-iro (Biru Lapis)", hex: "#005F73" },
  { name: "Gunjyō-iro (Biru Laut)", hex: "#51A8DD" },
  { name: "Sora-iro (Biru Langit)", hex: "#A0D8EF" },
  { name: "Fuji-iro (Ungu Wisteria)", hex: "#8B5FBF" },
  { name: "Kyō-murasaki (Ungu Kyoto)", hex: "#77428D" },
  { name: "Kurumi-iro (Cokelat Kenari)", hex: "#7A5C43" },
  { name: "Kitsune-iro (Cokelat Rubah)", hex: "#E5AA7A" },
  { name: "Gin-iro (Abu Perak)", hex: "#706E6B" },
];

export const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTag,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#E64A19");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialTag) {
      setName(initialTag.name);
      setColor(initialTag.color || "#E64A19");
    } else {
      setName("");
      setColor("#E64A19");
    }
    setError("");
  }, [initialTag, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama label/tag wajib diisi");
      return;
    }
    onSave({
      name: name.trim(),
      color,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={initialTag ? "Edit Tag" : "Tambah Tag Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama Tag */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-tag-name"
            className="text-xs font-bold uppercase tracking-wider text-(--text-primary)"
          >
            Nama Tag <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-tag-name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            className="w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent-color) focus:outline-none"
          />
          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}
        </div>

        {/* Live Badge Loop Preview */}
        <div className="space-y-1.5">
          <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-4 flex items-center justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition"
              style={{
                backgroundColor: `${color}26`, // 15% opacity background
                color: color,
              }}
            >
              {/* Solid 100% small circle identification */}
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span>{name || "Nama Tag"}</span>
            </span>
          </div>
        </div>

        {/* Pilihan Warna Dento-iro */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">
            Pilih Warna Dento-iro
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {TAG_COLORS.map((tc) => {
              const isSelected = color === tc.hex;
              return (
                <button
                  key={tc.hex}
                  type="button"
                  title={tc.name}
                  onClick={() => setColor(tc.hex)}
                  className="group flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform ${
                      isSelected
                        ? "scale-110 ring-2 ring-offset-2 ring-current"
                        : "group-hover:scale-105"
                    }`}
                    style={{ backgroundColor: tc.hex, color: tc.hex }}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-white drop-shadow-xs" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
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
            {initialTag ? "Simpan Perubahan" : "Tambah Tag"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
