import React, { useState, useMemo, useEffect, useRef } from "react";
import gsap from "gsap";
import Fuse from "fuse.js";
import { Product, Category, Tag, OwnershipStatus } from "../types";
import { ProductCard } from "../components/products/ProductCard";
import {
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Sparkles,
  Coins,
  CheckCircle2,
} from "lucide-react";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  tags: Tag[];
  onOpenAddModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onDuplicateProduct?: (product: Product) => void;
  onUpdateStatus?: (product: Product, status: OwnershipStatus) => void;
  onSelectProductDetail: (product: Product) => void;
  onNavigateToCategory: (categoryId: string) => void;
  onNavigateToTag: (tagName: string) => void;
  initialFilterCategory?: string;
  initialFilterTag?: string;
  initialFilterStatus?: OwnershipStatus | "all";
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  tags,
  onOpenAddModal,
  onEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onUpdateStatus,
  onSelectProductDetail,
  onNavigateToCategory,
  onNavigateToTag,
  initialFilterCategory,
  initialFilterTag,
  initialFilterStatus = "all",
}) => {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    OwnershipStatus | "all"
  >(initialFilterStatus);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>(
    initialFilterCategory || "",
  );
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>(
    initialFilterTag || "",
  );
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortOption, setSortOption] = useState<
    "newest" | "oldest" | "price_low" | "price_high" | "name_asc" | "name_desc"
  >("newest");

  // Close filter modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFilterModalOpen) {
        setIsFilterModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFilterModalOpen]);

  // View Mode: default Card (Grid)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageInput, setJumpPageInput] = useState("");
  const itemsPerPage = 8;

  const cardListContainerRef = useRef<HTMLDivElement>(null);

  // Sync initial filters if prop changes
  useEffect(() => {
    if (initialFilterCategory !== undefined)
      setSelectedCategoryFilter(initialFilterCategory);
  }, [initialFilterCategory]);

  useEffect(() => {
    if (initialFilterTag !== undefined) setSelectedTagFilter(initialFilterTag);
  }, [initialFilterTag]);

  // Categories map for fast lookup
  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Tags map for fast lookup
  const tagsMap = useMemo(() => {
    const map = new Map<string, Tag>();
    tags.forEach((t) => map.set(t.name.toLowerCase(), t));
    return map;
  }, [tags]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: products.length,
      wishlist: 0,
      saving: 0,
      purchased: 0,
    };
    products.forEach((p) => {
      const st = p.ownershipStatus || "wishlist";
      if (counts[st] !== undefined) {
        counts[st]++;
      }
    });
    return counts;
  }, [products]);

  // Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ["name", "description", "tags"],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, [products]);

  // Filter & Search Pipeline
  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. Fuzzy Search
    if (searchQuery.trim()) {
      result = fuse.search(searchQuery.trim()).map((res) => res.item);
    }

    // 2. Ownership Status Filter
    if (selectedStatusFilter !== "all") {
      result = result.filter(
        (p) => (p.ownershipStatus || "wishlist") === selectedStatusFilter,
      );
    }

    // 3. Category Filter
    if (selectedCategoryFilter) {
      result = result.filter((p) => p.categoryId === selectedCategoryFilter);
    }

    // 4. Tag Filter
    if (selectedTagFilter) {
      result = result.filter(
        (p) =>
          p.tags &&
          p.tags.some(
            (t) => t.toLowerCase() === selectedTagFilter.toLowerCase(),
          ),
      );
    }

    // 5. Price Min & Max
    const minVal = minPrice ? parseInt(minPrice.replace(/\D/g, ""), 10) : 0;
    const maxVal = maxPrice
      ? parseInt(maxPrice.replace(/\D/g, ""), 10)
      : Infinity;

    if (minVal > 0) {
      result = result.filter((p) => p.price >= minVal);
    }
    if (maxVal < Infinity && maxVal > 0) {
      result = result.filter((p) => p.price <= maxVal);
    }

    // 6. Sort
    const sorted = [...result].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    products,
    searchQuery,
    fuse,
    selectedStatusFilter,
    selectedCategoryFilter,
    selectedTagFilter,
    minPrice,
    maxPrice,
    sortOption,
  ]);

  // Pagination calculation
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // GSAP Staggered Entrance Animation on card list
  useEffect(() => {
    if (!cardListContainerRef.current) return;
    const cards = cardListContainerRef.current.children;
    if (cards.length > 0) {
      gsap.killTweensOf(cards);
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        },
      );
    }
  }, [paginatedProducts, viewMode]);

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpPageInput("");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedStatusFilter("all");
    setSelectedCategoryFilter("");
    setSelectedTagFilter("");
    setMinPrice("");
    setMaxPrice("");
    setSortOption("newest");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedStatusFilter !== "all") count++;
    if (selectedCategoryFilter) count++;
    if (selectedTagFilter) count++;
    if (minPrice || maxPrice) count++;
    if (sortOption !== "newest") count++;
    return count;
  }, [
    searchQuery,
    selectedStatusFilter,
    selectedCategoryFilter,
    selectedTagFilter,
    minPrice,
    maxPrice,
    sortOption,
  ]);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div id="products-dashboard" className="space-y-5 animate-fade-in pb-12">
      {/* Top Header & Tombol Tambah Produk */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-(--text-primary)">
            Daftar Produk
          </h2>
        </div>

        {/* Tombol Tambah Produk */}
        <button
          type="button"
          id="btn-add-product"
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--accent-color) px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Control Bar: Tombol Filter & Sort (Modal Panel), Item Info, View Mode (Grid/List) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--border-color) bg-(--bg-card) p-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tombol Pemicu Modal Panel Filter & Sort */}
          <button
            type="button"
            id="btn-open-filter-modal"
            onClick={() => setIsFilterModalOpen(true)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
              hasActiveFilters
                ? "border-(--accent-color) bg-(--accent-soft) text-(--accent-color)"
                : "border-(--border-color) bg-(--bg-main) text-(--text-primary) hover:border-(--accent-color)"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-(--accent-color)" />
            <span>Filter &amp; Sort</span>
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-(--accent-color) px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              id="btn-clear-all-filters-bar"
              onClick={clearAllFilters}
              className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer px-2 py-1"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Info Jumlah Produk & View Mode Switcher */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-(--text-muted) hidden sm:inline-block">
            Menampilkan{" "}
            <strong className="text-(--text-primary) font-num">
              {filteredProducts.length}
            </strong>{" "}
            produk
          </span>

          {/* View Mode Switcher: Card (Grid) vs List */}
          <div className="flex items-center rounded-xl border border-(--border-color) bg-(--bg-main) p-1">
            <button
              type="button"
              id="btn-view-mode-grid"
              onClick={() => setViewMode("grid")}
              title="Tampilan Card / Grid"
              className={`rounded-lg p-1.5 transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-(--bg-card) text-(--accent-color) shadow-xs"
                  : "text-(--text-muted) hover:text-(--text-primary)"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="btn-view-mode-list"
              onClick={() => setViewMode("list")}
              title="Tampilan List"
              className={`rounded-lg p-1.5 transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-(--bg-card) text-(--accent-color) shadow-xs"
                  : "text-(--text-muted) hover:text-(--text-primary)"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Summary (muncul di luar jika ada filter aktif agar user tahu kondisi daftar) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
          <span className="text-(--text-muted) text-[11px] font-semibold uppercase tracking-wider">
            Filter Aktif:
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-color) bg-(--bg-card) px-3 py-1 font-medium text-(--text-primary)">
              <Search className="w-3 h-3 text-(--accent-color)" />
              <span>"{searchQuery}"</span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-(--text-muted) hover:text-(--text-primary)"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedStatusFilter !== "all" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-color) bg-(--bg-card) px-3 py-1 font-medium text-(--text-primary)">
              <span>
                Status:{" "}
                {selectedStatusFilter === "wishlist"
                  ? "Ingin Dibeli"
                  : selectedStatusFilter === "saving"
                    ? "Sedang Ditabung"
                    : "Sudah Dibeli"}
              </span>
              <button
                type="button"
                onClick={() => setSelectedStatusFilter("all")}
                className="text-(--text-muted) hover:text-(--text-primary)"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCategoryFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-color) bg-(--bg-card) px-3 py-1 font-medium text-(--text-primary)">
              <span>
                Kategori:{" "}
                {categoriesMap.get(selectedCategoryFilter)?.name ||
                  selectedCategoryFilter}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("")}
                className="text-(--text-muted) hover:text-(--text-primary)"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedTagFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-color) bg-(--bg-card) px-3 py-1 font-medium text-(--text-primary)">
              <span>Tag: {selectedTagFilter}</span>
              <button
                type="button"
                onClick={() => setSelectedTagFilter("")}
                className="text-(--text-muted) hover:text-(--text-primary)"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-color) bg-(--bg-card) px-3 py-1 font-medium text-(--text-primary)">
              <span>
                Harga: {minPrice ? `Rp ${minPrice}` : "0"} -{" "}
                {maxPrice ? `Rp ${maxPrice}` : "∞"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="text-(--text-muted) hover:text-(--text-primary)"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {sortOption !== "newest" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-color) bg-(--bg-card) px-3 py-1 font-medium text-(--text-primary)">
              <span>
                Urut:{" "}
                {sortOption === "oldest"
                  ? "Terlama"
                  : sortOption === "price_low"
                    ? "Termurah"
                    : sortOption === "price_high"
                      ? "Termahal"
                      : sortOption === "name_asc"
                        ? "A-Z"
                        : "Z-A"}
              </span>
              <button
                type="button"
                onClick={() => setSortOption("newest")}
                className="text-(--text-muted) hover:text-(--text-primary)"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* MODAL PANEL: FILTER, SEARCH & SORT */}
      {isFilterModalOpen && (
        <div
          id="modal-filter-sort-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div
            id="modal-filter-sort-container"
            className="relative w-full max-w-2xl rounded-2xl border border-(--border-color) bg-(--bg-card) p-5 sm:p-6 shadow-2xl space-y-5 my-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-(--border-color) pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent-soft) text-(--accent-color)">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-(--text-primary)">
                    Filter &amp; Sort Produk
                  </h3>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-filter-modal"
                onClick={() => setIsFilterModalOpen(false)}
                className="rounded-xl p-2 text-(--text-muted) hover:text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
              {/* 1. PENCARIAN PRODUK (SEARCH) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-(--text-primary) flex items-center gap-1.5">
                  <span>Search</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-(--text-muted)" />
                  <input
                    id="input-product-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cari..."
                    className="w-full rounded-xl border border-(--border-color) bg-(--bg-main) py-2.5 pl-10 pr-10 text-xs sm:text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent-color) focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. STATUS KEPEMILIKAN BARANG (OWNERSHIP STATUS) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">
                    Status Kepemilikan Produk
                  </label>
                  {selectedStatusFilter !== "all" && (
                    <span className="text-[11px] font-medium text-(--accent-color)">
                      Pilihan:{" "}
                      {selectedStatusFilter === "wishlist"
                        ? "Ingin Dibeli"
                        : selectedStatusFilter === "saving"
                          ? "Sedang Ditabung"
                          : "Sudah Dibeli"}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: "all" as const,
                      label: "Semua Status",
                      count: statusCounts.all,
                      icon: null,
                    },
                    {
                      id: "wishlist" as const,
                      label: "Ingin Dibeli",
                      count: statusCounts.wishlist,
                      icon: Sparkles,
                    },
                    {
                      id: "saving" as const,
                      label: "Sedang Ditabung",
                      count: statusCounts.saving,
                      icon: Coins,
                    },
                    {
                      id: "purchased" as const,
                      label: "Sudah Dibeli",
                      count: statusCounts.purchased,
                      icon: CheckCircle2,
                    },
                  ].map((tab) => {
                    const isSelected = selectedStatusFilter === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setSelectedStatusFilter(tab.id);
                          setCurrentPage(1);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? "border-(--accent-color) bg-(--accent-soft) text-(--accent-color) ring-1 ring-(--accent-color)"
                            : "border-(--border-color) bg-(--bg-main) text-(--text-muted) hover:text-(--text-primary)"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {Icon ? (
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-(--text-muted) shrink-0 ml-1 mr-1" />
                          )}
                          <span className="text-xs font-bold leading-tight truncate">
                            {tab.label}
                          </span>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-1 font-num ${
                            isSelected
                              ? "bg-(--accent-color) text-white"
                              : "bg-black/5 dark:bg-white/10 text-(--text-muted)"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. KATEGORI & TAG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Filter Kategori */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                    Kategori
                  </label>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => {
                      setSelectedCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-xl border border-(--border-color) bg-(--bg-main) px-3 py-2 text-xs text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Tag */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                    Tag
                  </label>
                  <select
                    value={selectedTagFilter}
                    onChange={(e) => {
                      setSelectedTagFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-xl border border-(--border-color) bg-(--bg-main) px-3 py-2 text-xs text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
                  >
                    <option value="">Semua Tag</option>
                    {tags.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. RENTANG HARGA */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                  Rentang Harga
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Harga Minimum"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-xl border border-(--border-color) bg-(--bg-main) px-3 py-2 text-xs text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Harga Maksimum"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-xl border border-(--border-color) bg-(--bg-main) px-3 py-2 text-xs text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
                  />
                </div>
              </div>

              {/* 5. URUTKAN BERDASARKAN */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted) flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Urutkan Berdasarkan</span>
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="w-full rounded-xl border border-(--border-color) bg-(--bg-main) px-3 py-2 text-xs text-(--text-primary) focus:border-(--accent-color) focus:outline-none font-medium"
                >
                  <option value="newest">Terbaru Ditambahkan</option>
                  <option value="oldest">Terlama Ditambahkan</option>
                  <option value="price_low">Harga Terendah (Termurah)</option>
                  <option value="price_high">Harga Tertinggi (Termahal)</option>
                  <option value="name_asc">Nama Produk (A - Z)</option>
                  <option value="name_desc">Nama Produk (Z - A)</option>
                </select>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-between border-t border-(--border-color) pt-4">
              <div>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    id="btn-reset-filters-modal"
                    onClick={clearAllFilters}
                    className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                  >
                    Reset Filter
                  </button>
                ) : (
                  <span className="text-xs text-(--text-muted)">
                    Tidak ada filter aktif
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-apply-filters-modal"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="rounded-xl bg-(--accent-color) px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition cursor-pointer"
                >
                  Tampilkan ({filteredProducts.length}) Produk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product List Grid or List */}
      {paginatedProducts.length > 0 ? (
        <div
          ref={cardListContainerRef}
          id="product-items-container"
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
              : "flex flex-col gap-3"
          }
        >
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              category={categoriesMap.get(product.categoryId || "")}
              tagsMap={tagsMap}
              onCardClick={() => onSelectProductDetail(product)}
              onEdit={() => onEditProduct(product)}
              onDelete={() => onDeleteProduct(product)}
              onDuplicate={onDuplicateProduct}
              onUpdateStatus={onUpdateStatus}
              onCategoryClick={onNavigateToCategory}
              onTagClick={onNavigateToTag}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card) p-12 text-center">
          <p className="text-lg font-bold text-(--text-muted)">
            Belum Ada Produk
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-(--border-color) bg-(--bg-card) p-12 text-center">
          <p className="text-sm font-semibold text-(--text-primary)">
            Tidak ada produk yang cocok dengan pencarian atau filter
          </p>
          <p className="mt-1 text-xs text-(--text-muted)">
            Coba bersihkan kata kunci pencarian atau reset filter untuk
            menampilkan produk kembali
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-4 rounded-xl border border-(--border-color) bg-(--bg-main) px-4 py-2 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* Pagination Module: Next/Prev buttons, numbered pages, and Jump to Page */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-(--border-color)">
          <span className="text-xs text-(--text-muted)">
            Halaman{" "}
            <strong className="text-(--text-primary)">{currentPage}</strong>{" "}
            dari {totalPages} ({filteredProducts.length} produk)
          </span>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              type="button"
              id="btn-pagination-prev"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-(--border-color) bg-(--bg-card) p-2 text-(--text-primary) disabled:opacity-40 disabled:cursor-not-allowed hover:border-(--accent-color) transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
              )
              .map((pageNum, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && pageNum - prev > 1;
                return (
                  <React.Fragment key={pageNum}>
                    {showEllipsis && (
                      <span className="px-1 text-xs text-(--text-muted)">
                        ...
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 min-w-8 rounded-xl px-2 text-xs font-bold transition cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-(--accent-color) text-white shadow-xs"
                          : "border border-(--border-color) bg-(--bg-card) text-(--text-primary) hover:border-(--accent-color)"
                      }`}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                );
              })}

            {/* Next Button */}
            <button
              type="button"
              id="btn-pagination-next"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-(--border-color) bg-(--bg-card) p-2 text-(--text-primary) disabled:opacity-40 disabled:cursor-not-allowed hover:border-(--accent-color) transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to Page input */}
          <form onSubmit={handleJumpPage} className="flex items-center gap-1.5">
            <span className="text-xs text-(--text-muted)">Lompat ke:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder="#"
              className="h-8 w-14 rounded-xl border border-(--border-color) bg-(--bg-card) text-center text-xs font-bold text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
            />
            <button
              type="submit"
              className="h-8 rounded-xl border border-(--border-color) bg-(--bg-main) px-2.5 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) cursor-pointer"
            >
              Pergi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
