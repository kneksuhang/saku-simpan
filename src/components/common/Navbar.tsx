import React, { useState } from "react";
import { ActiveTab, ThemeMode } from "../../types";
import {
  Menu,
  X,
  Sun,
  Moon,
  Download,
  Lock,
  Command,
  Keyboard,
} from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  isPinEnabled: boolean;
  onLockApp?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcutsHelp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  themeMode,
  onToggleTheme,
  isPinEnabled,
  onLockApp,
  onOpenCommandPalette,
  onOpenShortcutsHelp,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: "statistik", label: "Statistik" },
    { id: "produk", label: "Produk" },
    { id: "kategori", label: "Kategori" },
    { id: "tag", label: "Tag" },
    { id: "pengaturan", label: "Pengaturan" },
  ];

  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        id="app-navbar"
        className="sticky top-0 z-40 w-full border-b border-(--border-color) bg-(--bg-card) backdrop-blur-md transition-colors"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo / Brand: ONLY text name, NO icon and NO initial box as strictly instructed */}
          <button
            type="button"
            onClick={() => handleSelect("produk")}
            className="text-left focus:outline-none"
          >
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-(--text-primary)">
              s<span className="text-(--accent-color)">A</span>ku simpan
            </span>
          </button>

          {/* Desktop Navigation (Horizontal) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  style={{
                    color: isActive ? "var(--accent-color)" : undefined,
                    backgroundColor: isActive
                      ? "var(--accent-soft)"
                      : "transparent",
                  }}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "shadow-xs"
                      : "text-(--text-muted) hover:text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* PWA Install Button */}
            {isInstallable && (
              <button
                type="button"
                id="btn-install-pwa"
                onClick={install}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-main) px-3 py-1.5 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-(--accent-color)" />
                <span>Pasang PWA</span>
              </button>
            )}

            {isIOS && (
              <button
                type="button"
                onClick={() => setShowIOSGuide(true)}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-main) px-2.5 py-1.5 text-xs font-medium text-(--text-primary)"
              >
                <span>Instal iOS</span>
              </button>
            )}

            {/* Manual PIN Lock Trigger if PIN enabled */}
            {isPinEnabled && onLockApp && (
              <button
                type="button"
                id="btn-lock-screen"
                onClick={onLockApp}
                title="Kunci Aplikasi"
                className="rounded-xl border border-(--border-color) p-2 text-(--text-muted) hover:text-(--accent-color) hover:border-(--accent-color) transition"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* Command Palette Trigger */}
            {onOpenCommandPalette && (
              <button
                type="button"
                id="btn-open-command-palette"
                onClick={onOpenCommandPalette}
                title="Command Palette & Cari Cepat (Ctrl+K)"
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-main) px-2.5 py-1.5 text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent-color) transition cursor-pointer"
              >
                <Command className="w-3.5 h-3.5 text-(--accent-color)" />
                <kbd className="font-mono text-[10px] bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Keyboard Shortcuts Help */}
            {onOpenShortcutsHelp && (
              <button
                type="button"
                id="btn-open-shortcuts-help"
                onClick={onOpenShortcutsHelp}
                title="Pintasan Keyboard (?)"
                className="hidden lg:flex rounded-xl border border-(--border-color) p-2 text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent-color) transition bg-(--bg-main) cursor-pointer"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            )}

            {/* Dark/Light Toggle */}
            <button
              type="button"
              id="btn-toggle-theme"
              onClick={onToggleTheme}
              title={
                themeMode === "light"
                  ? "Beralih ke Mode Gelap"
                  : "Beralih ke Mode Terang"
              }
              className="rounded-xl border border-(--border-color) p-2 text-(--text-primary) hover:border-(--accent-color) transition bg-(--bg-main)"
            >
              {themeMode === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              id="btn-hamburger-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
              className="md:hidden rounded-xl border border-(--border-color) p-2 text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Slider */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-(--bg-card) border-l border-(--border-color) p-6 shadow-2xl flex flex-col justify-between z-10 animate-slide-in">
            <div>
              {/* Slider Header: ONLY brand text name, no icon or box as instructed */}
              <div className="flex items-center justify-between pb-5 border-b border-(--border-color)">
                <span className="text-xl font-bold tracking-tight text-(--text-primary)">
                  s<span className="text-(--accent-color)">A</span>ku simpan
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-1 text-(--text-muted) hover:text-(--text-primary)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="mt-6 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      style={{
                        color: isActive ? "var(--accent-color)" : undefined,
                        backgroundColor: isActive
                          ? "var(--accent-soft)"
                          : "transparent",
                      }}
                      className={`w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "shadow-xs"
                          : "text-(--text-muted) hover:text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-(--border-color) space-y-3">
              {isInstallable && (
                <button
                  type="button"
                  onClick={() => {
                    install();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-(--accent-color) px-4 py-2.5 text-sm font-bold text-white shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang Aplikasi (PWA)</span>
                </button>
              )}

              {isPinEnabled && onLockApp && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLockApp();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-(--border-color) px-4 py-2.5 text-sm font-medium text-(--text-muted) hover:text-(--text-primary)"
                >
                  <Lock className="w-4 h-4" />
                  <span>Kunci Sekarang</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-(--bg-card) p-6 border border-(--border-color) shadow-2xl">
            <h4 className="text-base font-bold text-(--text-primary)">
              Pasang di iPhone / iPad
            </h4>
            <p className="mt-2 text-xs text-(--text-muted) leading-relaxed">
              1. Buka menu <strong>Share / Bagikan</strong> di bilah bawah
              browser Safari.
              <br />
              2. Gulir ke bawah dan pilih{" "}
              <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-(--accent-color) py-2 text-xs font-semibold text-white"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
