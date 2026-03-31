"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload, X, Plus } from "lucide-react";
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
    variantType: "color" as "color" | "shade",
    images: [""],
    variants: [] as Array<{
      colorName: string;
      shadeName: string;
      shadeImage: string;
      colorHex: string;
      price: number;
      stock: number;
      images: string[];
    }>,
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
            const variants = (data.data.variants || []).map((v: any) => ({
              colorName: v.colorName || "",
              shadeName: v.shadeName || "",
              shadeImage: v.shadeImage || "",
              colorHex: v.colorHex || "#ff0000",
              price: v.price || data.data.price || 0,
              stock: typeof v.stock === "number" ? v.stock : 0,
              images: v.images?.length ? v.images : [""],
            }));

            const inferredVariantType =
              data.data.variantType ||
              ((data.data.variants || []).some((v: any) => Boolean(v.shadeName))
                ? "shade"
                : "color");

            setProduct({
              ...data.data,
              variantType: inferredVariantType,
              variants,
              images: data.data.images?.length ? data.data.images : [""],
            });
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
      variants: product.variants.map((v) => ({
        ...v,
        colorName: v.colorName.trim(),
        shadeName: v.shadeName.trim(),
        shadeImage: v.shadeImage.trim(),
        images: v.images.filter((img) => img.trim().length > 0),
      })),
    };

    if (payload.variants.length > 0) {
      payload.stock = payload.variants.reduce(
        (sum, v) => sum + (Number(v.stock) || 0),
        0,
      );
    }

    if (
      payload.images.length === 0 &&
      payload.variants.every((v) => v.images.length === 0)
    ) {
      setSaveError(
        "Please upload or add at least one generic or variant product image.",
      );
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
        setSaveError("Save request timed out. Check network access.");
      } else {
        console.error(err);
        setSaveError("Unexpected save error. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleImageChange = (
    index: number,
    value: string,
    variantIdx: number = -1,
  ) => {
    if (variantIdx === -1) {
      const newImages = [...product.images];
      newImages[index] = value;
      setProduct({ ...product, images: newImages });
    } else {
      const newVariants = [...product.variants];
      newVariants[variantIdx].images[index] = value;
      setProduct({ ...product, variants: newVariants });
    }
  };

  const handleImageUpload = async (
    files: FileList | null,
    variantIdx: number = -1,
  ) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");

    try {
      const uploadedUrls: string[] = [];
      const errors: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          errors.push(`${file.name}: not an image`);
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
        if (variantIdx === -1) {
          setProduct((prev) => ({
            ...prev,
            images: [
              ...prev.images.filter((img) => img.trim().length > 0),
              ...uploadedUrls,
            ],
          }));
        } else {
          setProduct((prev) => {
            const newV = [...prev.variants];
            newV[variantIdx].images = [
              ...newV[variantIdx].images.filter((img) => img.trim().length > 0),
              ...uploadedUrls,
            ];
            return { ...prev, variants: newV };
          });
        }
      }

      if (errors.length > 0) {
        setUploadError(errors.join(" | "));
      }
    } catch (err) {
      console.error(err);
      setUploadError("Unexpected upload error.");
    }
    setUploading(false);
  };

  const addVariant = () => {
    setProduct({
      ...product,
      variants: [
        ...product.variants,
        {
          colorName: "",
          shadeName: "",
          shadeImage: "",
          colorHex: "#ff0000",
          price: product.price,
          stock: 0,
          images: [""],
        },
      ],
    });
  };

  const handleShadeImageUpload = async (
    files: FileList | null,
    variantIdx: number,
  ) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");

    try {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setUploadError(`${file.name}: not an image`);
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data?.url) {
        updateVariant(variantIdx, "shadeImage", data.url);
      } else {
        setUploadError(data?.error || "Shade image upload failed.");
      }
    } catch (err) {
      console.error(err);
      setUploadError("Unexpected shade image upload error.");
    }

    setUploading(false);
  };

  const updateVariant = (variantIdx: number, field: string, value: any) => {
    const newVariants = [...product.variants];
    (newVariants[variantIdx] as any)[field] = value;
    setProduct({ ...product, variants: newVariants });
  };

  const removeVariant = (variantIdx: number) => {
    const newVariants = product.variants.filter((_, idx) => idx !== variantIdx);
    setProduct({ ...product, variants: newVariants });
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
              Default Price (Rs) *
            </label>
            <input
              required
              type="number"
              step="0.01"
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.price}
              onChange={(e) =>
                setProduct({
                  ...product,
                  price: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
              Original Price (Rs)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.originalPrice}
              onChange={(e) =>
                setProduct({
                  ...product,
                  originalPrice: parseFloat(e.target.value) || 0,
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
            {product.variants.length === 0 ? (
              <>
                <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
                  Initial Stock *
                </label>
                <input
                  required
                  type="number"
                  className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
                  value={product.stock}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </>
            ) : (
              <>
                <label className="block text-sm font-semibold text-[var(--jade-muted-strong)]">
                  Total Stock (from variants)
                </label>
                <div className="w-full px-4 py-3 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-xl text-[var(--jade-text)]">
                  {product.variants.reduce(
                    (sum, v) => sum + (Number(v.stock) || 0),
                    0,
                  )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-4 md:col-span-2">
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

        {/* Global/Default Images */}
        <div className="space-y-4 border-t border-[var(--jade-border)] pt-8">
          <label className="block text-lg font-serif text-[var(--jade-text)]">
            Default Product Images
          </label>
          <div className="flex flex-col gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-jade-pink)] cursor-pointer">
              <Upload size={18} />
              <span>{uploading ? "Uploading..." : "Upload Images"}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files, -1)}
                disabled={uploading}
              />
            </label>
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
                onChange={(e) => handleImageChange(idx, e.target.value, -1)}
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
            + Add another default image URL
          </button>
        </div>

        {/* Variants Section */}
        <div className="space-y-4 border-t border-[var(--jade-border)] pt-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <label className="block text-lg font-serif text-[var(--jade-text)]">
                Product Variants
              </label>
              <div>
                <label className="block text-xs font-semibold text-[var(--jade-muted)] mb-1">
                  Variant Mode
                </label>
                <select
                  value={product.variantType}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      variantType: e.target.value as "color" | "shade",
                    })
                  }
                  className="px-3 py-2 bg-[var(--jade-input)] border border-[var(--jade-border)] rounded-lg outline-none text-[var(--jade-text)]"
                >
                  <option value="color">Color</option>
                  <option value="shade">Shade</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded-lg text-sm font-semibold text-[var(--jade-text)] hover:border-[var(--color-jade-pink)]"
            >
              <Plus size={16} /> Add Variant
            </button>
          </div>

          {product.variants.length === 0 ? (
            <p className="text-sm text-[var(--jade-muted)]">
              No variants added. The default price and images will be used.
            </p>
          ) : (
            <div className="space-y-6">
              {product.variants.map((variant, vIdx) => (
                <div
                  key={vIdx}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-[var(--jade-bg)] space-y-4 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeVariant(vIdx)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                  >
                    <X size={20} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--jade-muted)] mb-1">
                        {product.variantType === "shade"
                          ? "Shade Name"
                          : "Color Name"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          product.variantType === "shade"
                            ? "e.g. 008 2000"
                            : "e.g. Ruby Red"
                        }
                        className="w-full px-3 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-lg outline-none text-[var(--jade-text)]"
                        value={
                          product.variantType === "shade"
                            ? variant.shadeName
                            : variant.colorName
                        }
                        onChange={(e) =>
                          updateVariant(
                            vIdx,
                            product.variantType === "shade"
                              ? "shadeName"
                              : "colorName",
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>
                    {product.variantType === "color" ? (
                      <div>
                        <label className="block text-xs font-semibold text-[var(--jade-muted)] mb-1">
                          Color Hex
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                            value={variant.colorHex}
                            onChange={(e) =>
                              updateVariant(vIdx, "colorHex", e.target.value)
                            }
                          />
                          <input
                            type="text"
                            className="flex-grow px-3 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-lg outline-none text-[var(--jade-text)] uppercase"
                            value={variant.colorHex}
                            onChange={(e) =>
                              updateVariant(vIdx, "colorHex", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-[var(--jade-muted)] mb-1">
                          Shade Preview Image
                        </label>
                        <div className="space-y-2">
                          <label className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-jade-pink)] cursor-pointer">
                            <Upload size={14} /> Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleShadeImageUpload(e.target.files, vIdx)
                              }
                            />
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            className="w-full px-3 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-lg outline-none text-[var(--jade-text)]"
                            value={variant.shadeImage}
                            onChange={(e) =>
                              updateVariant(vIdx, "shadeImage", e.target.value)
                            }
                          />
                          <p className="text-xs text-[var(--jade-muted)]">
                            This image is only for the shade selector thumbnail.
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-[var(--jade-muted)] mb-1">
                        Price (Rs)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-lg outline-none text-[var(--jade-text)]"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(
                            vIdx,
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--jade-muted)] mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-lg outline-none text-[var(--jade-text)]"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(
                            vIdx,
                            "stock",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Variant Images */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-semibold text-[var(--jade-muted)]">
                        Variant Images
                      </label>
                      <label className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-jade-pink)] cursor-pointer">
                        <Upload size={14} /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(e.target.files, vIdx)
                          }
                        />
                      </label>
                    </div>

                    {variant.images.map((img, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://..."
                          className="flex-grow px-3 py-2 text-sm bg-[var(--jade-card)] border border-[var(--jade-border)] rounded-lg outline-none text-[var(--jade-text)]"
                          value={img}
                          onChange={(e) =>
                            handleImageChange(idx, e.target.value, vIdx)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newVariants = [...product.variants];
                            newVariants[vIdx].images = newVariants[
                              vIdx
                            ].images.filter((_, i) => i !== idx);
                            setProduct({ ...product, variants: newVariants });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newVariants = [...product.variants];
                        newVariants[vIdx].images.push("");
                        setProduct({ ...product, variants: newVariants });
                      }}
                      className="text-[var(--color-jade-pink)] text-xs font-semibold hover:underline"
                    >
                      + Add Variant Image URL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-jade-pink)] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-3 disabled:bg-[var(--jade-border)] disabled:text-[var(--jade-muted)]"
        >
          <Save size={20} />
          {loading ? "Saving..." : "Save Product Details"}
        </button>
        {saveError && (
          <p className="text-sm text-red-500 text-center">{saveError}</p>
        )}
      </form>
    </div>
  );
}
