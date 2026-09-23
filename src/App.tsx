import React, { useState, useEffect, useCallback } from "react";
import { db, seedDefaultData } from "./db";
import {
  Product,
  Category,
  Tag,
  ThemeMode,
  PinConfig,
  TelegramConfig,
  ActiveTab,
  OwnershipStatus,
} from "./types";
import { applyThemeToDocument } from "./theme/dentoIro";
import { Navbar } from "./components/common/Navbar";
import { PinLockScreen } from "./components/common/PinLockScreen";
import { ConfirmModal } from "./components/common/ConfirmModal";

// Modals
import { ProductFormModal } from "./components/products/ProductFormModal";
import { ProductDetailModal } from "./components/products/ProductDetailModal";
import { CategoryModal } from "./components/categories/CategoryModal";
import { TagModal } from "./components/tags/TagModal";
import { CommandPaletteModal } from "./components/common/CommandPaletteModal";
import { KeyboardShortcutsModal } from "./components/common/KeyboardShortcutsModal";

// Views
import { StatisticsView } from "./views/StatisticsView";
import { ProductsView } from "./views/ProductsView";
import { CategoriesView } from "./views/CategoriesView";
import { TagsView } from "./views/TagsView";
import { SettingsView } from "./views/SettingsView";

// Helper to determine initial tab from URL path without '#'
const getTabFromPathname = (): ActiveTab => {
  const path = window.location.pathname
    .replace(/^\/+/, "")
    .split("/")[0]
    .toLowerCase();
  if (path === "statistik" || path === "statistics") return "statistik";
  if (path === "kategori" || path === "categories") return "kategori";
  if (path === "tag" || path === "tags") return "tag";
  if (path === "pengaturan" || path === "settings") return "pengaturan";
  return "produk";
};

export function App() {
  // Navigation State (URL path based, clean without '#')
  const [activeTab, setActiveTab] = useState<ActiveTab>(getTabFromPathname);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null);

  // Data from Dexie
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Theme & Accent State
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("saku_theme_mode") as ThemeMode) || "light";
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem("saku_accent_color") || "#E64A19";
  });
  const [customTextColor, setCustomTextColor] = useState<string | undefined>(
    () => {
      return localStorage.getItem("saku_custom_text_color") || undefined;
    },
  );

  // Command Palette & Shortcut Modals State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  // PIN Protection State
  const [pinConfig, setPinConfig] = useState<PinConfig>(() => {
    const saved = localStorage.getItem("saku_pin_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          // Selalu otomatis terkunci jika pin aktif saat aplikasi dibuka atau di-refresh
          isLocked: parsed.enabled ? true : false,
        };
      } catch {
        return { enabled: false, pin: "", isLocked: false };
      }
    }
    return { enabled: false, pin: "", isLocked: false };
  });

  // Telegram Config State
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem("saku_telegram_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { botToken: "", chatId: "", enabled: false };
      }
    }
    return { botToken: "", chatId: "", enabled: false };
  });

  // Product Modals State
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Category Modals State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Tag Modals State
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Generic Confirm Delete Modal State
  const [confirmDeleteState, setConfirmDeleteState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  // Apply Theme & Accent to CSS variables whenever changed
  useEffect(() => {
    applyThemeToDocument(
      themeMode,
      accentColor,
      customTextColor ? { primary: customTextColor } : undefined,
    );
    localStorage.setItem("saku_theme_mode", themeMode);
    localStorage.setItem("saku_accent_color", accentColor);
    if (customTextColor) {
      localStorage.setItem("saku_custom_text_color", customTextColor);
    } else {
      localStorage.removeItem("saku_custom_text_color");
    }
  }, [themeMode, accentColor, customTextColor]);

  // Clean URL Routing popstate listener (no '#')
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPathname();
      setActiveTab(tab);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Global Keyboard Shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // New Product Shortcut (Ctrl+N or Cmd+N)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setEditingProduct(null);
        setIsProductFormOpen(true);
        return;
      }

      // If user is focused on an input, textarea or select, ignore single key shortcuts
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement?.getAttribute("contenteditable") === "true";

      if (isInput) return;

      // Single Key Hotkeys:
      // 'c' -> Create / Add Product
      if (
        e.key.toLowerCase() === "c" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setEditingProduct(null);
        setIsProductFormOpen(true);
        return;
      }

      // '1' -> Produk
      if (e.key === "1") {
        e.preventDefault();
        handleTabChange("produk");
        return;
      }

      // '2' -> Statistik
      if (e.key === "2") {
        e.preventDefault();
        handleTabChange("statistik");
        return;
      }

      // '3' -> Kategori
      if (e.key === "3") {
        e.preventDefault();
        handleTabChange("kategori");
        return;
      }

      // '4' -> Tag
      if (e.key === "4") {
        e.preventDefault();
        handleTabChange("tag");
        return;
      }

      // '5' -> Pengaturan
      if (e.key === "5") {
        e.preventDefault();
        handleTabChange("pengaturan");
        return;
      }

      // 't' -> Toggle Theme
      if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
        return;
      }

      // 'l' -> Lock App (if PIN enabled)
      if (e.key.toLowerCase() === "l" && pinConfig.enabled) {
        e.preventDefault();
        setPinConfig((prev) => ({ ...prev, isLocked: true }));
        return;
      }

      // '?' -> Shortcuts Help
      if (e.key === "?") {
        e.preventDefault();
        setIsShortcutsHelpOpen(true);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pinConfig.enabled]);

  // Persist PIN Config
  const handleUpdatePinConfig = (newConfig: PinConfig) => {
    setPinConfig(newConfig);
    localStorage.setItem("saku_pin_config", JSON.stringify(newConfig));
  };

  // Persist Telegram Config
  const handleUpdateTelegramConfig = (newConfig: TelegramConfig) => {
    setTelegramConfig(newConfig);
    localStorage.setItem("saku_telegram_config", JSON.stringify(newConfig));
  };

  // Load Initial Data from Dexie
  const refreshData = useCallback(async () => {
    try {
      await seedDefaultData();
      const p = await db.products.toArray();
      const c = await db.categories.toArray();
      const t = await db.tags.toArray();
      setProducts(p);
      setCategories(c);
      setTags(t);
    } catch (err) {
      console.error("Failed to load data from Dexie:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Unlock PIN
  const handleUnlockPin = () => {
    setPinConfig((prev) => ({ ...prev, isLocked: false }));
  };

  // Reset PIN (if forgotten)
  const handleResetPin = () => {
    const emptyConfig: PinConfig = { enabled: false, pin: "", isLocked: false };
    setPinConfig(emptyConfig);
    localStorage.removeItem("saku_pin_config");
  };

  // Switch Active Tab with Clean URL Routing (NO '#')
  const handleTabChange = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (tabId !== "categories" && tabId !== "kategori")
      setSelectedCategoryId(null);
    if (tabId !== "tags" && tabId !== "tag") setSelectedTagName(null);

    const targetPath = tabId === "produk" ? "/" : `/${tabId}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Direct Drill-down Navigations with Clean URL
  const handleNavigateToCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setActiveTab("kategori");
    if (window.location.pathname !== "/kategori") {
      window.history.pushState(null, "", "/kategori");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateToTag = (tagName: string) => {
    setSelectedTagName(tagName);
    setActiveTab("tag");
    if (window.location.pathname !== "/tag") {
      window.history.pushState(null, "", "/tag");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Product CRUD
  const handleSaveProduct = async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ) => {
    const now = Date.now();
    if (editingProduct) {
      await db.products.update(editingProduct.id, {
        ...productData,
        updatedAt: now,
      });
    } else {
      const newProduct: Product = {
        id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        ...productData,
        createdAt: now,
        updatedAt: now,
      };
      await db.products.add(newProduct);
    }
    setIsProductFormOpen(false);
    setEditingProduct(null);
    await refreshData();
  };

  // Quick Duplicate Product
  const handleDuplicateProduct = async (product: Product) => {
    const now = Date.now();
    const duplicatedProduct: Product = {
      ...product,
      id: `prod_${now}_${Math.random().toString(36).slice(2, 7)}`,
      name: `${product.name} (Salinan)`,
      createdAt: now,
      updatedAt: now,
    };
    await db.products.add(duplicatedProduct);
    await refreshData();
    if (detailProduct?.id === product.id) {
      setDetailProduct(duplicatedProduct);
    }
  };

  // Update Ownership Status directly
  const handleUpdateProductStatus = async (
    product: Product,
    newStatus: OwnershipStatus,
  ) => {
    const now = Date.now();
    await db.products.update(product.id, {
      ownershipStatus: newStatus,
      updatedAt: now,
    });
    await refreshData();
    if (detailProduct?.id === product.id) {
      setDetailProduct({
        ...detailProduct,
        ownershipStatus: newStatus,
        updatedAt: now,
      });
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setConfirmDeleteState({
      isOpen: true,
      title: "Hapus Produk Wishlist",
      message: `Apakah Anda yakin ingin menghapus "${product.name}" dari daftar simpanan Anda? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        await db.products.delete(product.id);
        if (detailProduct?.id === product.id) setDetailProduct(null);
        await refreshData();
      },
    });
  };

  // Quick create tag from inside product form
  const handleQuickCreateTag = async (tagName: string): Promise<Tag> => {
    const newTag: Tag = {
      id: `tag_${Date.now()}`,
      name: tagName,
      color: accentColor,
      createdAt: Date.now(),
    };
    await db.tags.add(newTag);
    await refreshData();
    return newTag;
  };

  // Category CRUD
  const handleSaveCategory = async (
    catData: Omit<Category, "id" | "createdAt">,
  ) => {
    if (editingCategory) {
      await db.categories.update(editingCategory.id, {
        ...catData,
      });
    } else {
      const newCat: Category = {
        id: `cat_${Date.now()}`,
        ...catData,
        createdAt: Date.now(),
      };
      await db.categories.add(newCat);
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    await refreshData();
  };

  const handleDeleteCategory = (category: Category) => {
    setConfirmDeleteState({
      isOpen: true,
      title: "Hapus Kategori",
      message: `Apakah Anda yakin ingin menghapus kategori "${category.name}"? Produk yang terkait tidak akan dihapus, tetapi akan menjadi tanpa kategori.`,
      onConfirm: async () => {
        await db.categories.delete(category.id);
        if (selectedCategoryId === category.id) setSelectedCategoryId(null);
        await refreshData();
      },
    });
  };

  // Tag CRUD
  const handleSaveTag = async (tagData: Omit<Tag, "id" | "createdAt">) => {
    if (editingTag) {
      await db.tags.update(editingTag.id, {
        ...tagData,
      });
    } else {
      const newTag: Tag = {
        id: `tag_${Date.now()}`,
        ...tagData,
        createdAt: Date.now(),
      };
      await db.tags.add(newTag);
    }
    setIsTagModalOpen(false);
    setEditingTag(null);
    await refreshData();
  };

  const handleDeleteTag = (tag: Tag) => {
    setConfirmDeleteState({
      isOpen: true,
      title: "Hapus Tag",
      message: `Apakah Anda yakin ingin menghapus label/tag "${tag.name}"?`,
      onConfirm: async () => {
        await db.tags.delete(tag.id);
        if (selectedTagName?.toLowerCase() === tag.name.toLowerCase())
          setSelectedTagName(null);
        await refreshData();
      },
    });
  };

  // Reset Theme Default Handler
  const handleResetThemeDefault = () => {
    const defaultAccent = "#E64A19";
    setAccentColor(defaultAccent);
    localStorage.setItem("saku_accent_color", defaultAccent);
    setCustomTextColor(undefined);
    localStorage.removeItem("saku_custom_text_color");
  };

  // Import Data Handler
  const handleImportData = async (data: {
    products?: Product[];
    categories?: Category[];
    tags?: Tag[];
  }) => {
    if (data.categories && data.categories.length > 0) {
      await db.categories.bulkPut(data.categories);
    }
    if (data.tags && data.tags.length > 0) {
      await db.tags.bulkPut(data.tags);
    }
    if (data.products && data.products.length > 0) {
      await db.products.bulkPut(data.products);
    }
    await refreshData();
  };

  // Reset Entire Database
  const handleResetAllData = async () => {
    await db.products.clear();
    await db.categories.clear();
    await db.tags.clear();
    setProducts([]);
    setCategories([]);
    setTags([]);
    setSelectedCategoryId(null);
    setSelectedTagName(null);
    handleTabChange("produk");
  };

  // Render PIN Screen if PIN is enabled & locked
  if (pinConfig.enabled && pinConfig.isLocked) {
    return (
      <PinLockScreen
        correctPin={pinConfig.pin}
        pin={pinConfig.pin}
        onUnlock={handleUnlockPin}
        onResetPin={handleResetPin}
      />
    );
  }

  // Tags map for detail modal
  const tagsMap = new Map<string, Tag>();
  tags.forEach((t) => tagsMap.set(t.name.toLowerCase(), t));

  return (
    <div className="min-h-screen bg-(--bg-main) text-(--text-primary) selection:bg-(--accent-color) selection:text-white transition-colors duration-200">
      {/* Responsive Navbar with Hamburger Menu & No Sidebar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        themeMode={themeMode}
        onToggleTheme={() =>
          setThemeMode(themeMode === "light" ? "dark" : "light")
        }
        isPinEnabled={pinConfig.enabled}
        onLockApp={() => setPinConfig((prev) => ({ ...prev, isLocked: true }))}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {isLoadingData ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--accent-color) border-t-transparent" />
          </div>
        ) : (
          <>
            {/* 1. Dasbor Statistik */}
            {(activeTab === "statistik" || activeTab === "statistics") && (
              <StatisticsView
                products={products}
                categories={categories}
                tags={tags}
              />
            )}

            {/* 2. Dasbor Produk */}
            {(activeTab === "produk" || activeTab === "products") && (
              <ProductsView
                products={products}
                categories={categories}
                tags={tags}
                onOpenAddModal={() => {
                  setEditingProduct(null);
                  setIsProductFormOpen(true);
                }}
                onEditProduct={(prod) => {
                  setEditingProduct(prod);
                  setIsProductFormOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
                onDuplicateProduct={handleDuplicateProduct}
                onUpdateStatus={handleUpdateProductStatus}
                onSelectProductDetail={(prod) => setDetailProduct(prod)}
                onNavigateToCategory={handleNavigateToCategory}
                onNavigateToTag={handleNavigateToTag}
              />
            )}

            {/* 3. Dasbor Kategori */}
            {(activeTab === "kategori" || activeTab === "categories") && (
              <CategoriesView
                categories={categories}
                products={products}
                tags={tags}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                onOpenAddCategory={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                onEditCategory={(cat) => {
                  setEditingCategory(cat);
                  setIsCategoryModalOpen(true);
                }}
                onDeleteCategory={handleDeleteCategory}
                onSelectProductDetail={(prod) => setDetailProduct(prod)}
                onEditProduct={(prod) => {
                  setEditingProduct(prod);
                  setIsProductFormOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
                onDuplicateProduct={handleDuplicateProduct}
                onUpdateStatus={handleUpdateProductStatus}
                onNavigateToTag={handleNavigateToTag}
              />
            )}

            {/* 4. Dasbor Tag */}
            {(activeTab === "tag" || activeTab === "tags") && (
              <TagsView
                tags={tags}
                products={products}
                categories={categories}
                selectedTagName={selectedTagName}
                onSelectTag={setSelectedTagName}
                onOpenAddTag={() => {
                  setEditingTag(null);
                  setIsTagModalOpen(true);
                }}
                onEditTag={(tag) => {
                  setEditingTag(tag);
                  setIsTagModalOpen(true);
                }}
                onDeleteTag={handleDeleteTag}
                onSelectProductDetail={(prod) => setDetailProduct(prod)}
                onEditProduct={(prod) => {
                  setEditingProduct(prod);
                  setIsProductFormOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
                onDuplicateProduct={handleDuplicateProduct}
                onUpdateStatus={handleUpdateProductStatus}
                onNavigateToCategory={handleNavigateToCategory}
              />
            )}

            {/* 5. Dasbor Pengaturan */}
            {(activeTab === "pengaturan" || activeTab === "settings") && (
              <SettingsView
                currentAccentHex={accentColor}
                onSelectAccent={setAccentColor}
                customTextColor={customTextColor}
                onSelectCustomTextColor={setCustomTextColor}
                onResetThemeDefault={handleResetThemeDefault}
                themeMode={themeMode}
                pinConfig={pinConfig}
                onUpdatePinConfig={handleUpdatePinConfig}
                telegramConfig={telegramConfig}
                onUpdateTelegramConfig={handleUpdateTelegramConfig}
                products={products}
                categories={categories}
                tags={tags}
                onImportData={handleImportData}
                onResetAllData={handleResetAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Product Form Modal (Add & Edit in strict input sequence) */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        categories={categories}
        tags={tags}
        onQuickCreateTag={handleQuickCreateTag}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        product={detailProduct}
        category={categories.find((c) => c.id === detailProduct?.categoryId)}
        tagsMap={tagsMap}
        onEdit={(prod) => {
          setEditingProduct(prod);
          setIsProductFormOpen(true);
        }}
        onDelete={handleDeleteProduct}
        onDuplicate={handleDuplicateProduct}
        onUpdateStatus={handleUpdateProductStatus}
        onCategoryClick={handleNavigateToCategory}
        onTagClick={handleNavigateToTag}
      />

      {/* Category Modal (Add & Edit with live Iconify search) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        initialCategory={editingCategory}
      />

      {/* Tag Modal (Add & Edit with circle identification) */}
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => {
          setIsTagModalOpen(false);
          setEditingTag(null);
        }}
        onSave={handleSaveTag}
        initialTag={editingTag}
      />

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleTabChange}
        onOpenAddProduct={() => {
          setEditingProduct(null);
          setIsProductFormOpen(true);
        }}
        onToggleTheme={() =>
          setThemeMode(themeMode === "light" ? "dark" : "light")
        }
        themeMode={themeMode}
        onLockApp={() => setPinConfig((prev) => ({ ...prev, isLocked: true }))}
        isPinEnabled={pinConfig.enabled}
        products={products}
        onSelectProduct={(prod) => setDetailProduct(prod)}
      />

      {/* Keyboard Shortcuts Help Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />

      {/* Generic Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDeleteState.isOpen}
        title={confirmDeleteState.title}
        message={confirmDeleteState.message}
        onClose={() =>
          setConfirmDeleteState((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmDeleteState.onConfirm}
      />
    </div>
  );
}

export default App;
