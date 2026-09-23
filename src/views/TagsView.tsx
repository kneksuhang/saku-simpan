import React, { useMemo, useRef, useEffect } from "react";
import gsap from "gsap";
import { Tag, Product, Category, OwnershipStatus } from "../types";
import { ProductCard } from "../components/products/ProductCard";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Tag as TagIcon,
  Package,
} from "lucide-react";

interface TagsViewProps {
  tags: Tag[];
  products: Product[];
  categories: Category[];
  selectedTagName?: string | null;
  onSelectTag: (tagName: string | null) => void;
  onOpenAddTag: () => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tag: Tag) => void;
  onSelectProductDetail: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onDuplicateProduct?: (product: Product) => void;
  onUpdateStatus?: (product: Product, status: OwnershipStatus) => void;
  onNavigateToCategory: (categoryId: string) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({
  tags,
  products,
  categories,
  selectedTagName,
  onSelectTag,
  onOpenAddTag,
  onEditTag,
  onDeleteTag,
  onSelectProductDetail,
  onEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onUpdateStatus,
  onNavigateToCategory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.children;
    if (items.length > 0) {
      gsap.killTweensOf(items);
      gsap.fromTo(
        items,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" },
      );
    }
  }, [selectedTagName, tags]);

  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const tagsMap = useMemo(() => {
    const map = new Map<string, Tag>();
    tags.forEach((t) => map.set(t.name.toLowerCase(), t));
    return map;
  }, [tags]);

  // Product counts per tag
  const tagProductCountMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      if (p.tags) {
        p.tags.forEach((t) => {
          const key = t.toLowerCase();
          map.set(key, (map.get(key) || 0) + 1);
        });
      }
    });
    return map;
  }, [products]);

  // Active Tag drill-down
  const activeTag = useMemo(() => {
    if (!selectedTagName) return null;
    return tags.find(
      (t) => t.name.toLowerCase() === selectedTagName.toLowerCase(),
    );
  }, [tags, selectedTagName]);

  const taggedProducts = useMemo(() => {
    if (!selectedTagName) return [];
    return products.filter(
      (p) =>
        p.tags &&
        p.tags.some((t) => t.toLowerCase() === selectedTagName.toLowerCase()),
    );
  }, [products, selectedTagName]);

  // 1. DETAIL DRILLDOWN: Specific Tag Page
  if (selectedTagName && activeTag) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="rounded-xl border border-(--border-color) bg-(--bg-card) p-2 text-(--text-primary) hover:border-(--accent-color) transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-sm font-bold"
                  style={{
                    backgroundColor: `${activeTag.color}26`, // 15% opacity
                    color: activeTag.color,
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: activeTag.color }}
                  />
                  <span>{activeTag.name}</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-(--text-muted)">
                Menampilkan semua {taggedProducts.length} produk spesifik dengan
                label tag ini
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEditTag(activeTag)}
            className="rounded-xl border border-(--border-color) bg-(--bg-card) px-3.5 py-2 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Ubah Warna / Nama</span>
          </button>
        </div>

        {/* Products with this tag */}
        {taggedProducts.length > 0 ? (
          <div
            ref={containerRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {taggedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={categoriesMap.get(p.categoryId || "")}
                tagsMap={tagsMap}
                onCardClick={() => onSelectProductDetail(p)}
                onEdit={() => onEditProduct(p)}
                onDelete={() => onDeleteProduct(p)}
                onDuplicate={onDuplicateProduct}
                onUpdateStatus={onUpdateStatus}
                onCategoryClick={onNavigateToCategory}
                onTagClick={(tag) => onSelectTag(tag)}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-(--border-color) bg-(--bg-card) p-12 text-center">
            <Package className="w-10 h-10 text-(--text-muted) mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-(--text-primary)">
              Belum ada produk dengan tag {activeTag.name}
            </p>
            <p className="mt-1 text-xs text-(--text-muted)">
              Sematkan tag ini ke produk wishlist Anda untuk melihatnya
              berkumpul di sini.
            </p>
          </div>
        )}
      </div>
    );
  }

  // 2. MAIN TAGS DIRECTORY: Berjejeran Menyesuaikan Panjang Tag
  return (
    <div id="tags-directory" className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-(--text-primary)">
            Dasbor Tag
          </h2>
        </div>

        <button
          type="button"
          id="btn-add-tag"
          onClick={onOpenAddTag}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--accent-color) px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tag</span>
        </button>
      </div>

      {/* Tag List: Menyesuaikan panjang tag dengan berjejeran (flex-wrap) */}
      <div className="rounded-xl border border-(--border-color) bg-(--bg-card) p-6 shadow-xs">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
            {tags.length} Tag Terdaftar
          </span>
        </div>

        {tags.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-lg font-bold text-(--text-muted)" mb-2>
              Belum Ada Tag
            </p>
          </div>
        ) : (
          <div
            ref={containerRef}
            id="tags-loop-collection"
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            {tags.map((tag) => {
              const count = tagProductCountMap.get(tag.name.toLowerCase()) || 0;
              return (
                <div
                  key={tag.id}
                  className="group relative inline-flex items-center rounded-full border transition-all duration-200 hover:shadow-sm"
                  style={{
                    backgroundColor: `${tag.color}26`, // 15% opacity background
                    borderColor: `${tag.color}50`,
                  }}
                >
                  {/* Main clickable tag button */}
                  <button
                    type="button"
                    onClick={() => onSelectTag(tag.name)}
                    className="inline-flex items-center gap-2 py-2 pl-3.5 pr-2 text-xs sm:text-sm font-bold transition"
                    style={{ color: tag.color }}
                  >
                    {/* Solid 100% circle identification */}
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                    <span className="ml-1 rounded-full bg-black/10 dark:bg-white/15 px-2 py-0.5 text-[11px] font-num">
                      {count}
                    </span>
                  </button>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center pr-2 pl-1 border-l border-black/10 dark:border-white/10 opacity-70 group-hover:opacity-100">
                    <button
                      type="button"
                      title="Edit Tag"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTag(tag);
                      }}
                      className="rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/15 transition text-(--text-primary)"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Hapus Tag"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTag(tag);
                      }}
                      className="rounded-full p-1 hover:bg-rose-500/20 text-rose-500 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
