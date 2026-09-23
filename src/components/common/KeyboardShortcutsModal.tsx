import React from "react";
import { Modal } from "./Modal";
import { Keyboard, Command } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const shortcutSections = [
    {
      title: "Navigasi Antarmuka",
      items: [
        { keys: ["1"], description: "Buka Halaman Produk" },
        { keys: ["2"], description: "Buka Halaman Statistik" },
        { keys: ["3"], description: "Buka Halaman Kategori" },
        { keys: ["4"], description: "Buka Halaman Tag / Label" },
        { keys: ["5"], description: "Buka Halaman Pengaturan" },
      ],
    },
    {
      title: "Aksi Cepat & Perintah",
      items: [
        {
          keys: ["Ctrl", "K"],
          description: "Buka Command Palette & Pencarian Cepat",
        },
        { keys: ["Ctrl", "N"], description: "Tambah Produk Wishlist Baru" },
        {
          keys: ["C"],
          description: "Buka Formulir Tambah Produk (di luar input)",
        },
        {
          keys: ["T"],
          description: "Alihkan Mode Terang (Washi) & Gelap (Kuroneko)",
        },
        { keys: ["L"], description: "Kunci Aplikasi (jika PIN aktif)" },
        { keys: ["?"], description: "Buka Bantuan Pintasan Keyboard Ini" },
        {
          keys: ["Esc"],
          description: "Tutup Modal / Jendela yang Sedang Terbuka",
        },
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title="Pintasan Keyboard (Keyboard Shortcuts)"
      subtitle="Tingkatkan efisiensi pengelolaan wishlist dengan hotkey praktis"
    >
      <div className="space-y-6">
        {shortcutSections.map((sec) => (
          <div key={sec.title} className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
              {sec.title}
            </h4>
            <div className="space-y-2">
              {sec.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-(--border-color) bg-(--bg-main)"
                >
                  <span className="text-xs font-medium text-(--text-primary)">
                    {it.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {it.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded-lg border border-(--border-color) bg-(--bg-card) px-2 py-1 text-[11px] font-mono font-bold text-(--text-primary) shadow-2xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
