"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Package, Tag } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  badge?: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchProducts();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--jade-muted)] font-semibold">
            Inventory
          </p>
          <h2 className="text-3xl font-serif text-[var(--jade-text)] mt-2">
            Manage Products
          </h2>
          <p className="text-[var(--jade-muted)] font-medium tracking-tight mt-2">
            Update, edit, or remove products from the catalog.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[var(--color-jade-pink)] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[var(--color-jade-pink-hover)] transition-colors flex items-center gap-2 shadow-lg shadow-pink-200"
        >
          <Plus size={20} />
          Add New Product
        </Link>
      </div>

      <div className="bg-[var(--jade-card)] p-4 rounded-2xl border border-[var(--jade-border)] shadow-sm flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--jade-muted)]"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or category..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded-xl px-4 py-2 text-sm text-[var(--jade-text)]"
        >
          <option value="All">All Categories</option>
          <option value="Skincare">Skincare</option>
          <option value="Makeup">Makeup</option>
          <option value="Haircare">Haircare</option>
          <option value="Fragrance">Fragrance</option>
          <option value="Clothing">Clothing</option>
        </select>
      </div>

      {/* Product Table */}
      <div className="bg-[var(--jade-card)] rounded-2xl border border-[var(--jade-border)] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--jade-bg)] border-b border-[var(--jade-border)]">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Product
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Category
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Price
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Stock
              </th>

              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--jade-border)]">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-8 bg-[var(--jade-bg)] rounded"></div>
                  </td>
                </tr>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-[var(--jade-bg)]/70 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-[var(--jade-text)] uppercase text-sm tracking-wide">
                      {product.name}
                    </div>
                    {product.badge && (
                      <span className="text-[10px] font-bold bg-pink-100 text-[var(--color-jade-pink)] px-1.5 py-0.5 rounded uppercase">
                        {product.badge}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--jade-text)] font-medium">
                    <div className="flex items-center gap-1.5">
                      <Tag
                        size={14}
                        className="text-[var(--color-jade-pink)]"
                      />
                      {product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--jade-text)]">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Package
                        size={14}
                        className={
                          product.stock < 10 ? "text-red-500" : "text-green-500"
                        }
                      />
                      <span
                        className={
                          product.stock < 10
                            ? "text-red-600 dark:text-red-400 font-bold"
                            : "text-[var(--jade-text)] font-medium"
                        }
                      >
                        {product.stock} units
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/edit/${product._id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center text-[var(--jade-muted)] font-serif text-lg"
                >
                  No products found. Try adjusting filters or add a new item.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
