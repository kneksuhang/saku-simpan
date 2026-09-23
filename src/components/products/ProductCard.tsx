import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { Product, Category, Tag, OwnershipStatus } from "../../types";
import {
  formatRupiah,
  getFaviconUrl,
  extractDomainCleanName,
} from "../../utils/format";
import {
  ExternalLink,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  Coins,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { IconifyIcon } from "../common/IconifyIcon";

interface ProductCardProps {
  product: Product;
  category?: Category;
  tagsMap: Map<string, Tag>;
  onCardClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: (product: Product) => void;
  onCategoryClick: (categoryId: string) => void;
  onTagClick: (tagName: string) => void;
  onUpdateStatus?: (product: Product, status: OwnershipStatus) => void;
  viewMode?: "grid" | "list";
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  category,
  tagsMap,
  onCardClick,
  onEdit,
  onDelete,
  onDuplicate,
  onCategoryClick,
  onTagClick,
  onUpdateStatus,
  viewMode = "grid",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);

  // GSAP micro-interaction on hover
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const handleMouseEnter = () => {
      gsap.to(el, {
        y: -4,
        duration: 0.25,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const getStatusBadge = (status?: OwnershipStatus) => {
    switch (status) {
      case "purchased":
        return {
          label: "Sudah Dibeli",
          icon: CheckCircle2,
          bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "saving":
        return {
          label: "Sedang Ditabung",
          icon: Coins,
          bg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "wishlist":
      default:
        return {
          label: "Ingin Dibeli",
          icon: Sparkles,
          bg: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
        };
    }
  };

  const statusBadge = getStatusBadge(product.ownershipStatus);
  const StatusIcon = statusBadge.icon;

  const allLinks =
    product.links && product.links.length > 0
      ? product.links
      : product.url
        ? [
            {
              id: "1",
              url: product.url,
              label: extractDomainCleanName(product.url),
            },
          ]
        : [];

  const primaryLink = allLinks[0];

  if (viewMode === "list") {
    return (
      <div
        ref={cardRef}
        id={`product-card-${product.id}`}
        onClick={onCardClick}
        className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl border border-(--border-color) bg-(--bg-card) p-4 cursor-pointer card-hover-shadow transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* 1. Foto / Gambar Produk (Uncropped) */}
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center p-1 border border-(--border-color)">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="text-xs text-(--text-muted) italic">
                Tanpa Foto
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            {/* Price & Status Row */}
            <div className="flex items-center gap-2">
              <p className="font-num text-base font-bold text-(--accent-color)">
                {formatRupiah(product.price)}
              </p>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge.bg}`}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{statusBadge.label}</span>
              </span>
            </div>

            {/* 3. Nama Produk */}
            <h4 className="text-sm sm:text-base font-bold text-(--text-primary) truncate">
              {product.name}
            </h4>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {/* 4. Kategori (Clickable) */}
              {category && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategoryClick(category.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-semibold bg-black/5 dark:bg-white/10 text-(--text-primary) hover:text-(--accent-color) transition"
                >
                  <IconifyIcon
                    icon={category.icon}
                    size={13}
                    color="var(--accent-color)"
                  />
                  <span>{category.name}</span>
                </button>
              )}

              {/* 5. Tag */}
              {product.tags &&
                product.tags.map((tagName) => {
                  const tagObj = tagsMap.get(tagName.toLowerCase());
                  const color = tagObj?.color || "#E64A19";
                  return (
                    <button
                      key={tagName}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTagClick(tagName);
                      }}
                      style={{
                        backgroundColor: `${color}26`,
                        color: color,
                      }}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition hover:scale-105"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span>{tagName}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Bottom Actions: Links, Duplicate, Edit, Hapus */}
        <div
          className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-(--border-color) shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {primaryLink && (
            <a
              href={
                primaryLink.url.startsWith("http")
                  ? primaryLink.url
                  : `https://${primaryLink.url}`
              }
              target="_blank"
              rel="noopener noreferrer"
              title={`Buka Tautan: ${primaryLink.label || primaryLink.url}`}
              className="rounded-lg p-2 text-(--text-muted) hover:text-(--accent-color) hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center gap-1"
            >
              {getFaviconUrl(primaryLink.url) && (
                <img
                  src={getFaviconUrl(primaryLink.url)!}
                  alt="icon"
                  className="w-3.5 h-3.5 rounded-xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              )}
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {onDuplicate && (
            <button
              type="button"
              title="Duplikasi Produk (Quick Duplicate)"
              onClick={() => onDuplicate(product)}
              className="rounded-lg p-2 text-(--text-muted) hover:text-(--accent-color) hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            title="Edit Produk"
            onClick={onEdit}
            className="rounded-lg p-2 text-(--text-muted) hover:text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Hapus Produk"
            onClick={onDelete}
            className="rounded-lg p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid / Card View (Default)
  return (
    <div
      ref={cardRef}
      id={`product-card-${product.id}`}
      onClick={onCardClick}
      className="group relative flex flex-col justify-between rounded-xl border border-(--border-color) bg-(--bg-card) p-4 cursor-pointer card-hover-shadow transition-colors"
    >
      <div className="space-y-3">
        {/* 1. FOTO / GAMBAR PRODUK (Uncropped, object-contain) */}
        <div className="relative h-48 w-full overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center p-2 border border-(--border-color)">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-(--text-muted) gap-1">
              <span className="text-xs">Foto tidak tersedia</span>
            </div>
          )}
        </div>

        {/* 2. HARGA (Font Sora, Formatted Rp) */}
        <div className="pt-0.5 flex *:items-center justify-between gap-2">
          <span className="font-num text-lg font-bold tracking-tight text-(--accent-color)">
            {formatRupiah(product.price)}
          </span>
          {/* Status Badge */}
          <div className="right-2 ">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold backdrop-blur-md shadow-xs ${statusBadge.bg}`}
            >
              <StatusIcon className="w-3 h-3" />
              <span>{statusBadge.label}</span>
            </span>
          </div>
        </div>

        {/* 3. NAMA PRODUK */}
        <h3 className="text-sm sm:text-base font-bold text-(--text-primary) leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* 4. KATEGORI */}
        <div>
          {category ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryClick(category.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-black/5 dark:bg-white/10 text-(--text-primary) hover:text-(--accent-color) hover:bg-(--accent-soft) transition"
            >
              <IconifyIcon
                icon={category.icon}
                size={14}
                color="var(--accent-color)"
              />
              <span>{category.name}</span>
            </button>
          ) : (
            <span className="text-[11px] text-(--text-muted) italic">
              Tanpa Kategori
            </span>
          )}
        </div>

        {/* 5. TAG */}
        <div className="flex flex-wrap gap-1.5">
          {product.tags && product.tags.length > 0 ? (
            product.tags.map((tagName) => {
              const tagObj = tagsMap.get(tagName.toLowerCase());
              const color = tagObj?.color || "#E64A19";
              return (
                <button
                  key={tagName}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick(tagName);
                  }}
                  style={{
                    backgroundColor: `${color}26`,
                    color: color,
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:scale-105"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>{tagName}</span>
                </button>
              );
            })
          ) : (
            <span className="text-[11px] text-(--text-muted) italic">
              Tanpa Tag
            </span>
          )}
        </div>

        {/* 6. DESKRIPSI */}
        {product.description && (
          <p className="text-xs text-(--text-muted) line-clamp-2 leading-relaxed pt-0.5">
            {product.description}
          </p>
        )}
      </div>

      {/* 7. TOMBOL LINK DI PALING BAWAH BERSEBELAHAN DENGAN DUPLICATE, EDIT DAN HAPUS */}
      <div
        className="mt-4 flex items-center justify-between border-t border-(--border-color) pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {allLinks.length > 0 ? (
            allLinks.length === 1 ? (
              <a
                href={
                  primaryLink.url.startsWith("http")
                    ? primaryLink.url
                    : `https://${primaryLink.url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                title={`Kunjungi: ${primaryLink.label || primaryLink.url}`}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-(--accent-color) hover:bg-(--accent-soft) transition"
              >
                {getFaviconUrl(primaryLink.url) && (
                  <img
                    src={getFaviconUrl(primaryLink.url)!}
                    alt=""
                    className="w-3.5 h-3.5 rounded-xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                )}
                <span>{primaryLink.label || "Kunjungi Link"}</span>
              </a>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setIsLinkDropdownOpen(!isLinkDropdownOpen)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-(--accent-color) hover:bg-(--accent-soft) transition"
                >
                  <span>{allLinks.length} Tautan</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {isLinkDropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-1 z-20 w-48 rounded-xl border border-(--border-color) bg-(--bg-card) p-1.5 shadow-xl space-y-1">
                    {allLinks.map((lnk) => (
                      <a
                        key={lnk.id}
                        href={
                          lnk.url.startsWith("http")
                            ? lnk.url
                            : `https://${lnk.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsLinkDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg p-2 text-xs text-(--text-primary) hover:bg-(--accent-soft) hover:text-(--accent-color) transition truncate"
                      >
                        {getFaviconUrl(lnk.url) && (
                          <img
                            src={getFaviconUrl(lnk.url)!}
                            alt=""
                            className="w-3.5 h-3.5 rounded-xs shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        )}
                        <span className="truncate">{lnk.label || lnk.url}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            <span className="text-[11px] text-(--text-muted)">
              Tanpa Tautan
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Duplicate Button */}
          {onDuplicate && (
            <button
              type="button"
              title="Duplikasi Produk (Quick Duplicate)"
              onClick={() => onDuplicate(product)}
              className="rounded-lg p-2 text-(--text-muted) hover:text-(--accent-color) hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            title="Edit Produk"
            onClick={onEdit}
            className="rounded-lg p-2 text-(--text-muted) hover:text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Hapus Produk"
            onClick={onDelete}
            className="rounded-lg p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
