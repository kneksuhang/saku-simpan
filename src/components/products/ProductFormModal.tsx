import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Modal } from "../common/Modal";
import {
  Product,
  Category,
  Tag,
  OwnershipStatus,
  ProductLink,
} from "../../types";
import {
  formatNumberWithDots,
  parseFormattedNumber,
  getFaviconUrl,
  extractDomainCleanName,
  extractDomain,
} from "../../utils/format";
import { COLOR_CANCEL } from "../../theme/dentoIro";
import {
  UploadCloud,
  Globe,
  Plus,
  Check,
  Search,
  Trash2,
  Sparkles,
  Coins,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { IconifyIcon } from "../common/IconifyIcon";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ) => void;
  initialProduct?: Product | null;
  categories: Category[];
  tags: Tag[];
  onQuickCreateTag: (tagName: string) => Promise<Tag>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  categories,
  tags,
  onQuickCreateTag,
}) => {
  const [name, setName] = useState("");

  const [priceInput, setPriceInput] = useState("");

  const [ownershipStatus, setOwnershipStatus] =
    useState<OwnershipStatus>("wishlist");

  const [categoryId, setCategoryId] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [productLinks, setProductLinks] = useState<ProductLink[]>([
    { id: "lnk_init", url: "", label: "" },
  ]);

  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const [description, setDescription] = useState("");

  // Validation
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate or reset form
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setPriceInput(formatNumberWithDots(initialProduct.price));
      setOwnershipStatus(initialProduct.ownershipStatus || "wishlist");
      setCategoryId(initialProduct.categoryId || "");
      setSelectedTags(initialProduct.tags || []);
      if (initialProduct.links && initialProduct.links.length > 0) {
        setProductLinks(initialProduct.links);
      } else if (initialProduct.url) {
        setProductLinks([
          {
            id: "lnk_1",
            url: initialProduct.url,
            label: extractDomainCleanName(initialProduct.url),
          },
        ]);
      } else {
        setProductLinks([{ id: "lnk_1", url: "", label: "" }]);
      }
      setImageUrl(initialProduct.imageUrl || "");
      setDescription(initialProduct.description || "");
    } else {
      resetForm();
    }
    setErrors({});
  }, [initialProduct, isOpen]);

  // GSAP Drag Pulse Effect
  useEffect(() => {
    if (dropZoneRef.current) {
      if (isDragging) {
        gsap.to(dropZoneRef.current, {
          scale: 1.02,
          borderWidth: "2.5px",
          borderColor: "var(--accent-color)",
          boxShadow: "0 0 16px var(--accent-soft)",
          duration: 0.25,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      } else {
        gsap.killTweensOf(dropZoneRef.current);
        gsap.to(dropZoneRef.current, {
          scale: 1,
          borderWidth: "1.5px",
          boxShadow: "none",
          duration: 0.2,
        });
      }
    }
  }, [isDragging]);

  const resetForm = () => {
    setName("");
    setPriceInput("");
    setOwnershipStatus("wishlist");
    setCategoryId("");
    setSelectedTags([]);
    setProductLinks([{ id: "lnk_1", url: "", label: "" }]);
    setImageUrl("");
    setDescription("");
    setErrors({});
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setPriceInput("");
    } else {
      const formatted = formatNumberWithDots(rawVal);
      setPriceInput(formatted);
    }
    if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
  };

  const handleCreateTag = async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
      const exists = tags.some(
        (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (!exists) {
        await onQuickCreateTag(trimmed);
      }
    }
    setTagInput("");
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateTag(tagInput);
    }
  };

  const toggleTagSelection = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  // Multi-link Handlers
  const handleAddLinkRow = () => {
    setProductLinks((prev) => [
      ...prev,
      {
        id: `lnk_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        url: "",
        label: "",
      },
    ]);
  };

  const handleUpdateLinkUrl = (index: number, newUrl: string) => {
    setProductLinks((prev) => {
      const updated = [...prev];
      const cleanName = extractDomainCleanName(newUrl);
      updated[index] = {
        ...updated[index],
        url: newUrl,
        label:
          updated[index].label || (cleanName !== "Tautan" ? cleanName : ""),
      };
      return updated;
    });
  };

  const handleUpdateLinkLabel = (index: number, newLabel: string) => {
    setProductLinks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], label: newLabel };
      return updated;
    });
  };

  const handleRemoveLinkRow = (index: number) => {
    if (productLinks.length <= 1) {
      setProductLinks([{ id: "lnk_1", url: "", label: "" }]);
      return;
    }
    setProductLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag-and-drop file upload
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        setIsImageLoading(true);
        reader.onload = (uploadEvent) => {
          setImageUrl(uploadEvent.target?.result as string);
          setIsImageLoading(false);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        setIsImageLoading(true);
        reader.onload = (uploadEvent) => {
          setImageUrl(uploadEvent.target?.result as string);
          setIsImageLoading(false);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; price?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Nama produk wajib diisi";
    }
    const numericPrice = parseFormattedNumber(priceInput);
    if (numericPrice <= 0) {
      newErrors.price = "Harga wajib diisi dengan nominal lebih dari Rp 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clean valid links
    const validLinks = productLinks.filter((l) => Boolean(l.url.trim()));
    const primaryUrl =
      validLinks.length > 0 ? validLinks[0].url.trim() : undefined;

    onSave({
      name: name.trim(),
      price: numericPrice,
      ownershipStatus,
      categoryId: categoryId || undefined,
      tags: selectedTags,
      url: primaryUrl,
      links: validLinks,
      imageUrl: imageUrl.trim() || undefined,
      description: description.trim() || undefined,
    });
    onClose();
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={initialProduct ? "Edit Produk" : "Tambah Produk Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. NAMA */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-product-name"
            className="text-xs font-bold tracking-wide uppercase text-(--text-primary)"
          >
            Nama Produk <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-product-name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name)
                setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            className="w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-2.5 text-sm text-(--text-primary)  focus:border-(--accent-color) focus:outline-none focus:ring-1 focus:ring-(--accent-color)"
          />
          {errors.name && (
            <p className="text-xs font-medium text-rose-500">{errors.name}</p>
          )}
        </div>

        {/* 2. HARGA */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-product-price"
            className="text-xs font-bold tracking-wide uppercase text-(--text-primary)"
          >
            Harga <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl border border-(--border-color) bg-(--bg-card) focus-within:border-(--accent-color) focus-within:ring-1 focus-within:ring-(--accent-color)">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="font-num text-sm font-bold text-(--accent-color)">
                Rp
              </span>
            </div>
            <input
              id="input-product-price"
              type="text"
              inputMode="numeric"
              required
              value={priceInput}
              onChange={handlePriceChange}
              placeholder="0"
              className="w-full rounded-xl bg-transparent py-2.5 pl-12 pr-4 font-num text-sm font-semibold text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none"
            />
          </div>
          {errors.price && (
            <p className="text-xs font-medium text-rose-500">{errors.price}</p>
          )}
        </div>

        {/* 3. STATUS KEPEMILIKAN PRODUK */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wide uppercase text-(--text-primary)">
            Status Kepemilikan Produk
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: "wishlist" as OwnershipStatus,
                label: "Ingin Dibeli",
                icon: Sparkles,
                desc: "Target impian",
              },
              {
                id: "saving" as OwnershipStatus,
                label: "Sedang Ditabung",
                icon: Coins,
                desc: "Proses menabung",
              },
              {
                id: "purchased" as OwnershipStatus,
                label: "Sudah Dibeli",
                icon: CheckCircle2,
                desc: "Sudah dimiliki",
              },
            ].map((st) => {
              const Icon = st.icon;
              const isSelected = ownershipStatus === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setOwnershipStatus(st.id)}
                  className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition ${
                    isSelected
                      ? "border-(--accent-color) bg-(--accent-soft) text-(--accent-color) ring-1 ring-(--accent-color)"
                      : "border-(--border-color) bg-(--bg-card) text-(--text-muted) hover:text-(--text-primary)"
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-xs font-bold leading-tight">
                    {st.label}
                  </span>
                  <span className="text-[10px] opacity-75 mt-0.5">
                    {st.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. KATEGORI */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wide uppercase text-(--text-primary)">
            Kategori
          </label>
          <div className="relative">
            <button
              type="button"
              id="btn-select-category"
              onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
              className="w-full flex items-center justify-between rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-2.5 text-sm text-(--text-primary) focus:border-(--accent-color) focus:outline-none text-left"
            >
              {categoryId ? (
                <span className="flex items-center gap-2">
                  {(() => {
                    const cat = categories.find((c) => c.id === categoryId);
                    return (
                      <>
                        <IconifyIcon
                          icon={cat?.icon || "lucide:folder"}
                          size={18}
                          color="var(--accent-color)"
                        />
                        <span className="font-medium">{cat?.name}</span>
                      </>
                    );
                  })()}
                </span>
              ) : (
                <span className="text-(--text-muted)">Pilih kategori...</span>
              )}
              <span className="text-xs text-(--text-muted)">▼</span>
            </button>

            {isCatDropdownOpen && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1.5 rounded-xl border border-(--border-color) bg-(--bg-card) p-2 shadow-xl">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-(--text-muted)" />
                  <input
                    type="text"
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    placeholder="Cari kategori..."
                    className="w-full rounded-lg border border-(--border-color) bg-(--bg-main) py-1.5 pl-9 pr-3 text-xs text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryId("");
                      setIsCatDropdownOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-xs transition ${
                      !categoryId
                        ? "bg-(--accent-soft) text-(--accent-color) font-bold"
                        : "text-(--text-muted) hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>Tanpa Kategori</span>
                  </button>
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(cat.id);
                        setIsCatDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                        categoryId === cat.id
                          ? "bg-(--accent-soft) text-(--accent-color) font-bold"
                          : "text-(--text-primary) hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconifyIcon
                          icon={cat.icon}
                          size={16}
                          color={cat.color || "var(--accent-color)"}
                        />
                        <span>{cat.name}</span>
                      </div>
                      {categoryId === cat.id && (
                        <Check className="w-4 h-4 text-(--accent-color)" />
                      )}
                    </button>
                  ))}
                  {filteredCategories.length === 0 && (
                    <p className="p-3 text-center text-xs text-(--text-muted)">
                      Kategori tidak ditemukan
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. TAG */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-tag-create"
            className="text-xs font-bold tracking-wide uppercase text-(--text-primary)"
          >
            Tag
          </label>
          <div className="flex gap-2">
            <input
              id="input-tag-create"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Ketik tag lalu tekan ENTER..."
              className="flex-1 rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-2 text-xs sm:text-sm text-(--text-primary) focus:border-(--accent-color) focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleCreateTag(tagInput)}
              className="rounded-xl border border-(--border-color) bg-(--bg-main) px-3 py-2 text-xs font-semibold text-(--text-primary) hover:border-(--accent-color) transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          {/* Selected & Available Tags List */}
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTagSelection(tag.name)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? "ring-1 ring-current"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: `${tag.color}26`,
                    color: tag.color,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. LINK PRODUK */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold tracking-wide uppercase text-(--text-primary)">
              Link Produk
            </label>
            <button
              type="button"
              id="btn-add-product-link"
              onClick={handleAddLinkRow}
              className="inline-flex items-center gap-1 text-xs font-semibold text-(--accent-color) hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Baru</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {productLinks.map((linkItem, idx) => {
              const favicon = getFaviconUrl(linkItem.url);
              const domain = extractDomain(linkItem.url);

              return (
                <div
                  key={linkItem.id || idx}
                  className="rounded-xl border border-(--border-color) bg-(--bg-card) p-2.5 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    {/* Live Favicon Badge */}
                    <div className="h-8 w-8 rounded-lg bg-(--bg-main) border border-(--border-color) flex items-center justify-center shrink-0">
                      {favicon ? (
                        <img
                          src={favicon}
                          alt="Favicon"
                          className="h-4 w-4 rounded-xs object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Globe className="w-4 h-4 text-(--text-muted)" />
                      )}
                    </div>

                    {/* URL Input */}
                    <input
                      type="url"
                      value={linkItem.url}
                      onChange={(e) => handleUpdateLinkUrl(idx, e.target.value)}
                      className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-(--text-primary)  border border-(--border-color) rounded-lg focus:border-(--accent-color) focus:outline-none"
                    />

                    {/* Label Input */}
                    <input
                      type="text"
                      value={linkItem.label || ""}
                      onChange={(e) =>
                        handleUpdateLinkLabel(idx, e.target.value)
                      }
                      placeholder="Label (e.g. Shopee)"
                      className="w-28 sm:w-36 bg-transparent px-2 py-1.5 text-xs text-(--text-primary) placeholder:text-(--text-muted) border border-(--border-color) rounded-lg focus:border-(--accent-color) focus:outline-none"
                    />

                    {/* Remove Link Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveLinkRow(idx)}
                      title="Hapus Link Ini"
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {domain && (
                    <div className="flex items-center gap-2 text-[11px] text-(--text-muted) pl-10">
                      <span>
                        Domain terdeteksi: <strong>{domain}</strong>
                      </span>
                      {linkItem.url && (
                        <a
                          href={
                            linkItem.url.startsWith("http")
                              ? linkItem.url
                              : `https://${linkItem.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-(--accent-color) hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Uji Link</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. DRAG-AND-DROP FOTO PRODUK + INPUT URL FOTO */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wide uppercase text-(--text-primary)">
            Foto Produk
          </label>

          {/* Drag & Drop Zone */}
          <div
            ref={dropZoneRef}
            id="dropzone-product-photo"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-xl border-dashed border-(--border-color) bg-(--bg-main) p-4 text-center transition-all duration-200 hover:border-(--accent-color)"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center justify-center gap-1.5 py-2">
              <div className="rounded-full bg-black/5 dark:bg-white/5 p-2.5 text-(--accent-color)">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-(--text-primary)">
                Tarik &amp; Lepas foto, atau{" "}
                <span className="text-(--accent-color) underline">
                  pilih dari perangkat
                </span>
              </p>
              <p className="text-[11px] text-(--text-muted)">
                Mendukung file JPG, PNG, WebP
              </p>
            </div>
          </div>

          {/* Input URL Foto Produk */}
          <div className="space-y-1">
            <input
              id="input-product-image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL Foto Produk"
              className="w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-2 text-xs sm:text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent-color) focus:outline-none"
            />
          </div>

          {/* Skeleton Loader & Preview (Uncropped) */}
          {imageUrl && (
            <div className="relative mt-2 overflow-hidden rounded-xl border border-(--border-color) bg-black/5 dark:bg-white/5 p-2">
              {isImageLoading && (
                <div className="h-44 w-full skeleton-shimmer rounded-lg" />
              )}
              <img
                src={imageUrl}
                alt="Preview produk"
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                className="max-h-56 w-full object-contain rounded-lg transition-opacity duration-300"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-[11px] font-medium text-white hover:bg-black transition"
              >
                Hapus Foto
              </button>
            </div>
          )}
        </div>

        {/* 8. DESKRIPSI (Textarea) */}
        <div className="space-y-1.5">
          <label
            htmlFor="textarea-product-desc"
            className="text-xs font-bold tracking-wide uppercase text-(--text-primary)"
          >
            Deskripsi
          </label>
          <textarea
            id="textarea-product-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="..."
            className="w-full rounded-xl border border-(--border-color) bg-(--bg-card) px-4 py-2.5 text-xs sm:text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent-color) focus:outline-none focus:ring-1 focus:ring-(--accent-color)"
          />
        </div>

        {/* 9. TOMBOL SIMPAN, BATAL, DAN RESET FORM */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-(--border-color)">
          <button
            type="button"
            id="btn-form-reset"
            onClick={resetForm}
            className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-white hover:opacity-90 active:scale-95 transition"
            style={{ backgroundColor: COLOR_CANCEL }}
          >
            Reset Form
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-form-cancel"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-white hover:opacity-90 active:scale-95 transition"
              style={{ backgroundColor: COLOR_CANCEL }}
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-form-save"
              className="rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              {initialProduct ? "Simpan Perubahan" : "Simpan Produk"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
