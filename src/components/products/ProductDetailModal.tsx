import React from "react";
import { Modal } from "../common/Modal";
import { Product, Category, Tag, OwnershipStatus } from "../../types";
import {
  formatRupiah,
  getFaviconUrl,
  extractDomainCleanName,
  extractDomain,
} from "../../utils/format";
import {
  ExternalLink,
  Edit2,
  Trash2,
  Copy,
  Calendar,
  Sparkles,
  Coins,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { IconifyIcon } from "../common/IconifyIcon";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  category?: Category;
  tagsMap: Map<string, Tag>;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  onCategoryClick: (categoryId: string) => void;
  onTagClick: (tagName: string) => void;
  onUpdateStatus?: (product: Product, newStatus: OwnershipStatus) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  category,
  tagsMap,
  onEdit,
  onDelete,
  onDuplicate,
  onCategoryClick,
  onTagClick,
  onUpdateStatus,
}) => {
  if (!product) return null;

  const getStatusBadge = (status?: OwnershipStatus) => {
    switch (status) {
      case "purchased":
        return {
          label: "Sudah Dibeli",
          icon: CheckCircle2,
          bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
        };
      case "saving":
        return {
          label: "Sedang Ditabung",
          icon: Coins,
          bg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
        };
      case "wishlist":
      default:
        return {
          label: "Ingin Dibeli",
          icon: Sparkles,
          bg: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25",
        };
    }
  };

  const currentStatusBadge = getStatusBadge(product.ownershipStatus);
  const StatusIcon = currentStatusBadge.icon;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title="Detail Produk"
      
    >
      <div className="space-y-5">
        {/* 1. FOTO / GAMBAR PRODUK (Uncropped, natural aspect ratio, object-contain) */}
        <div className="overflow-hidden rounded-xl border border-(--border-color) bg-black/5 dark:bg-white/5 p-4 flex items-center justify-center min-h-60 max-h-96">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-80 w-auto object-contain rounded-lg shadow-xs"
            />
          ) : (
            <div className="text-center text-(--text-muted) py-12">
              <p className="text-sm">Tidak ada foto terlampir</p>
            </div>
          )}
        </div>

        {/* 2. STATUS & HARGA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-(--text-muted)">
              Harga
            </span>
            <p className="font-num text-2xl sm:text-3xl font-bold text-(--accent-color) mt-0.5">
              {formatRupiah(product.price)}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-(--text-muted) block mb-1">
              Status Barang
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "wishlist" as OwnershipStatus, label: "Ingin Dibeli" },
                { id: "saving" as OwnershipStatus, label: "Sedang Ditabung" },
                { id: "purchased" as OwnershipStatus, label: "Sudah Dibeli" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() =>
                    onUpdateStatus && onUpdateStatus(product, st.id)
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    product.ownershipStatus === st.id
                      ? "border-(--accent-color) bg-(--accent-soft) text-(--accent-color)"
                      : "border-(--border-color) bg-(--bg-card) text-(--text-muted) hover:text-(--text-primary)"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. NAMA PRODUK */}
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-(--text-muted)">
            Nama Produk
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-(--text-primary) mt-0.5 leading-snug">
            {product.name}
          </h2>
        </div>

        {/* 4. KATEGORI (Clickable -> navigates directly to specific Category page) */}
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-(--text-muted) block mb-1">
            Kategori
          </span>
          {category ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCategoryClick(category.id);
              }}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold bg-black/5 dark:bg-white/10 text-(--text-primary) hover:text-(--accent-color) hover:bg-(--accent-soft) transition"
            >
              <IconifyIcon
                icon={category.icon}
                size={16}
                color="var(--accent-color)"
              />
              <span>{category.name}</span>
            </button>
          ) : (
            <span className="text-xs text-(--text-muted) italic">
              Belum dikategorikan
            </span>
          )}
        </div>

        {/* 5. TAG (Clickable -> navigates directly to specific Tag page) */}
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-(--text-muted) block mb-1">
            Label / Tag
          </span>
          <div className="flex flex-wrap gap-2">
            {product.tags && product.tags.length > 0 ? (
              product.tags.map((tagName) => {
                const tagObj = tagsMap.get(tagName.toLowerCase());
                const color = tagObj?.color || "#E64A19";
                return (
                  <button
                    key={tagName}
                    type="button"
                    onClick={() => {
                      onClose();
                      onTagClick(tagName);
                    }}
                    style={{
                      backgroundColor: `${color}26`,
                      color: color,
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition hover:scale-105"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span>{tagName}</span>
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-(--text-muted) italic">
                Tidak ada tag
              </span>
            )}
          </div>
        </div>

        {/* 6. MODUL TAUTAN PRODUK / MULTI-LINK WITH FAVICON */}
        {allLinks.length > 0 && (
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-(--text-muted) block mb-1.5">
              Tautan Pembelian ({allLinks.length})
            </span>
            <div className="space-y-2">
              {allLinks.map((lnk) => {
                const favicon = getFaviconUrl(lnk.url);
                const domain = extractDomain(lnk.url);
                const label = lnk.label || extractDomainCleanName(lnk.url);

                return (
                  <div
                    key={lnk.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-(--border-color) bg-(--bg-card)"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-(--bg-main) border border-(--border-color) flex items-center justify-center shrink-0">
                        {favicon ? (
                          <img
                            src={favicon}
                            alt=""
                            className="w-4 h-4 rounded-xs object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Globe className="w-4 h-4 text-(--text-muted)" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-(--text-primary) truncate">
                          {label}
                        </p>
                        <p className="text-[11px] text-(--text-muted) truncate">
                          {domain || lnk.url}
                        </p>
                      </div>
                    </div>

                    <a
                      href={
                        lnk.url.startsWith("http")
                          ? lnk.url
                          : `https://${lnk.url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-(--accent-color) text-white text-xs font-semibold hover:opacity-90 transition shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. DESKRIPSI */}
        {product.description && (
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-(--text-muted) block mb-1">
              Deskripsi &amp; Catatan
            </span>
            <div className="rounded-xl border border-(--border-color) bg-(--bg-main) p-3.5 text-xs sm:text-sm text-(--text-primary) whitespace-pre-wrap leading-relaxed">
              {product.description}
            </div>
          </div>
        )}

        {/* Tanggal Ditambahkan */}
        <div className="flex items-center gap-1.5 text-xs text-(--text-muted) pt-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Ditambahkan pada{" "}
            {new Date(product.createdAt).toLocaleDateString("id-ID", {
              dateStyle: "long",
            })}
          </span>
        </div>

        {/* Bottom Actions Row: Duplicate, Edit, Hapus */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-(--border-color)">
          <div>
            {onDuplicate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDuplicate(product);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-card) px-3.5 py-2 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) hover:text-(--accent-color) transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplikasi Produk</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--bg-card) px-3.5 py-2 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(product);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
