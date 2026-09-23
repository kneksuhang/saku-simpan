import React, { useState, useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { Category, Product, Tag, OwnershipStatus } from "../types";
import { formatRupiah } from "../utils/format";
import { IconifyIcon } from "../components/common/IconifyIcon";
import { ProductCard } from "../components/products/ProductCard";
import { Plus, Edit2, Trash2, ArrowLeft, Package, Folder } from "lucide-react";

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  tags: Tag[];
  selectedCategoryId?: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onOpenAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onSelectProductDetail: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onDuplicateProduct?: (product: Product) => void;
  onUpdateStatus?: (product: Product, status: OwnershipStatus) => void;
  onNavigateToTag: (tagName: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  tags,
  selectedCategoryId,
  onSelectCategory,
  onOpenAddCategory,
  onEditCategory,
  onDeleteCategory,
  onSelectProductDetail,
  onEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onUpdateStatus,
  onNavigateToTag,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Staggered entrance animation with GSAP
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.children;
    if (cards.length > 0) {
      gsap.killTweensOf(cards);
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" },
      );
    }
  }, [selectedCategoryId, categories]);

  const tagsMap = useMemo(() => {
    const map = new Map<string, Tag>();
    tags.forEach((t) => map.set(t.name.toLowerCase(), t));
    return map;
  }, [tags]);

  // Product counts per category
  const productCountMap = useMemo(() => {
    const map = new Map<string, { count: number; totalValue: number }>();
    products.forEach((p) => {
      const key = p.categoryId || "uncategorized";
      const curr = map.get(key) || { count: 0, totalValue: 0 };
      curr.count += 1;
      curr.totalValue += p.price;
      map.set(key, curr);
    });
    return map;
  }, [products]);

  // Current active category (if drill-down mode)
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const categoryProducts = useMemo(() => {
    if (!selectedCategoryId) return [];
    return products.filter((p) => p.categoryId === selectedCategoryId);
  }, [products, selectedCategoryId]);

  // 1. DETAIL VIEW: Spesifik Halaman Kategori
  if (selectedCategoryId && currentCategory) {
    const stats = productCountMap.get(currentCategory.id) || {
      count: 0,
      totalValue: 0,
    };
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Back Button & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="rounded-xl border border-(--border-color) bg-(--bg-card) p-2 text-(--text-primary) hover:border-(--accent-color) transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <IconifyIcon
                  icon={currentCategory.icon}
                  size={22}
                  color="var(--accent-color)"
                />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-(--text-primary)">
                  {currentCategory.name}
                </h2>
              </div>
              <p className="mt-1 text-xs text-(--text-muted)">
                Menampilkan semua {categoryProducts.length} produk spesifik
                terkait kategori ini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-2 text-right">
              <span className="text-[11px] uppercase tracking-wider text-(--text-muted) block">
                Total Nilai
              </span>
              <span className="font-num text-sm font-bold text-(--accent-color)">
                {formatRupiah(stats.totalValue)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditCategory(currentCategory)}
              className="rounded-xl border border-(--border-color) bg-(--bg-card) p-2.5 text-(--text-muted) hover:text-(--text-primary)"
              title="Edit Kategori Ini"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Grid of Category Products */}
        {categoryProducts.length > 0 ? (
          <div
            ref={containerRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {categoryProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={currentCategory}
                tagsMap={tagsMap}
                onCardClick={() => onSelectProductDetail(p)}
                onEdit={() => onEditProduct(p)}
                onDelete={() => onDeleteProduct(p)}
                onDuplicate={onDuplicateProduct}
                onUpdateStatus={onUpdateStatus}
                onCategoryClick={(catId) => onSelectCategory(catId)}
                onTagClick={onNavigateToTag}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-(--border-color) bg-(--bg-card) p-12 text-center">
            <Package className="w-10 h-10 text-(--text-muted) mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-(--text-primary)">
              Belum ada produk dalam kategori {currentCategory.name}
            </p>
            <p className="mt-1 text-xs text-(--text-muted)">
              Tambahkan produk baru dan pilih kategori ini untuk
              mengelompokkannya.
            </p>
          </div>
        )}
      </div>
    );
  }

  // 2. MAIN CATEGORIES DIRECTORY
  return (
    <div id="categories-directory" className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-(--text-primary)">
            Dasbor Kategori
          </h2>
        </div>

        <button
          type="button"
          id="btn-add-category"
          onClick={onOpenAddCategory}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--accent-color) px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Categories Cards Grid or Empty State */}
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) p-12 text-center">
          <p className="text-lg font-bold text-(--text-muted)">
            Belum Ada Kategori
          </p>
        </div>
      ) : (
        <div
          ref={containerRef}
          id="categories-card-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {categories.map((cat) => {
            const stats = productCountMap.get(cat.id) || {
              count: 0,
              totalValue: 0,
            };
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group relative flex flex-col justify-between rounded-xl border border-(--border-color) bg-(--bg-card) p-5 cursor-pointer card-hover-shadow transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${cat.color || "#E64A19"}26`, // 15% opacity
                        color: cat.color || "#E64A19",
                      }}
                    >
                      <IconifyIcon
                        icon={cat.icon}
                        size={24}
                        color={cat.color || "var(--accent-color)"}
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-(--text-primary) group-hover:text-(--accent-color) transition">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-(--text-muted) mt-0.5">
                        {stats.count} barang tersimpan
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      title="Edit Kategori"
                      onClick={() => onEditCategory(cat)}
                      className="rounded-lg p-1.5 text-(--text-muted) hover:text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Hapus Kategori"
                      onClick={() => onDeleteCategory(cat)}
                      className="rounded-lg p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-(--border-color) pt-3 text-xs">
                  <span className="text-(--text-muted)">Total Akumulasi:</span>
                  <span className="font-num font-bold text-(--text-primary)">
                    {formatRupiah(stats.totalValue)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
