"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";

export default function ProductForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEdit = !!id;

  const [product, setProduct] = useState({
    name: "",
    price: 0,
    originalPrice: 0,
    category: "Skincare",
    description: "",
    stock: 0,
    badge: "",
    images: [""],
    rating: 5,
    reviewCount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProduct(data.data);
          }
        });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveError("");

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `/api/products/${id}` : "/api/products";
    const payload = {
      ...product,
      images: product.images.filter((img) => img.trim().length > 0),
    };

    if (payload.images.length === 0) {
      setSaveError("Please upload or add at least one product image.");
      setLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json().catch(() => null);

      if (res.ok) {
        router.push("/admin/products");
      } else {
        setSaveError(data?.error || "Failed to save product.");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setSaveError(
          "Save request timed out. Check MongoDB Atlas IP whitelist and network access.",
        );
      } else {
        console.error(err);
        setSaveError("Unexpected save error. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...product.images];
    newImages[index] = value;
    setProduct({ ...product, images: newImages });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");

    try {
      const uploadedUrls: string[] = [];
      const errors: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          errors.push(`${file.name}: not an image file`);
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data?.url) {
          uploadedUrls.push(data.url);
        } else {
          errors.push(`${file.name}: ${data?.error || "upload failed"}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setProduct((prev) => ({
          ...prev,
          images: [
            ...prev.images.filter((img) => img.trim().length > 0),
            ...uploadedUrls,
          ],
        }));
      }

      if (errors.length > 0) {
        setUploadError(errors.join(" | "));
      }
    } catch (err) {
      console.error(err);
      setUploadError("Unexpected upload error. Please try again.");
    }

    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-[var(--jade-bg)] rounded-full transition-colors text-[var(--jade-text)]"
        >
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-3xl font-serif text-[var(--jade-text)]">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--jade-card)] p-8 rounded-2xl border border-[var(--jade-border)] shadow-sm space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
              Product Name *
            </label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
              Price ($) *
            </label>
            <input
              required
              type="number"
              step="0.01"
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.price}
              onChange={(e) =>
                setProduct({ ...product, price: parseFloat(e.target.value) })
              }
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
              Original Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.originalPrice}
              onChange={(e) =>
                setProduct({
                  ...product,
                  originalPrice: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
              Category *
            </label>
            <select
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.category}
              onChange={(e) =>
                setProduct({ ...product, category: e.target.value })
              }
            >
              <option>Skincare</option>
              <option>Makeup</option>
              <option>Haircare</option>
              <option>Fragrance</option>
              <option>Clothing</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
              Initial Stock *
            </label>
            <input
              required
              type="number"
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.stock}
              onChange={(e) =>
                setProduct({ ...product, stock: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
              Product Badge (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. SALE, NEW, HOT"
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.badge}
              onChange={(e) =>
                setProduct({ ...product, badge: e.target.value })
              }
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
              Star Rating (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.rating}
              onChange={(e) =>
                setProduct({ ...product, rating: parseFloat(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
            Description
          </label>
          <textarea
            rows={4}
            required
            className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
            Product Images
          </label>
          <div className="flex flex-col gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-jade-pink)] cursor-pointer">
              <Upload size={18} />
              <span>{uploading ? "Uploading..." : "Upload images"}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-[var(--jade-muted)]">
              You can upload multiple images or paste URLs below.
            </p>
            {uploadError && (
              <p className="text-xs text-red-500">{uploadError}</p>
            )}
          </div>
          {product.images.map((img, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                placeholder="https://..."
                className="flex-grow px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
                value={img}
                onChange={(e) => handleImageChange(idx, e.target.value)}
              />
              <button
                type="button"
                onClick={() =>
                  setProduct({
                    ...product,
                    images: product.images.filter((_, i) => i !== idx),
                  })
                }
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setProduct({ ...product, images: [...product.images, ""] })
            }
            className="text-[var(--color-jade-pink)] font-semibold text-sm hover:underline"
          >
            + Add another image URL
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-jade-pink)] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-3 disabled:bg-[var(--jade-border)] disabled:text-[var(--jade-muted)]"
        >
          <Save size={20} />
          {loading ? "Saving..." : "Save Product Details"}
        </button>
        {saveError && <p className="text-sm text-red-500">{saveError}</p>}
      </form>
    </div>
  );
}
