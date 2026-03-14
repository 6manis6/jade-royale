"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Star, Tag } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  badge?: string;
  rating: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
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
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchProducts();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-black dark:text-white">Manage Products</h2>
          <p className="text-black dark:text-gray-300 font-medium tracking-tight">Update, edit or delete your beauty products.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-[var(--color-jade-pink)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-jade-pink-hover)] transition-colors flex items-center gap-2 shadow-lg shadow-pink-200"
        >
          <Plus size={20} />
          Add New Product
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-[var(--jade-card)] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or category..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-[var(--jade-text)]">
          <option>All Categories</option>
          <option>Skincare</option>
          <option>Makeup</option>
          <option>Haircare</option>
        </select>
      </div>

      {/* Product Table */}
      <div className="bg-[var(--jade-card)] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-black dark:text-white">Product</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-black dark:text-white">Category</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-black dark:text-white">Price</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-black dark:text-white">Stock</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-black dark:text-white">Rating</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4"><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded"></div></td>
                </tr>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-black dark:text-white uppercase text-sm tracking-wide">{product.name}</div>
                    {product.badge && <span className="text-[10px] font-bold bg-pink-100 text-[var(--color-jade-pink)] px-1.5 py-0.5 rounded uppercase">{product.badge}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white font-medium">
                    <div className="flex items-center gap-1.5">
                      <Tag size={14} className="text-[var(--color-jade-pink)]" />
                      {product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-black dark:text-white">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Package size={14} className={product.stock < 10 ? 'text-red-500' : 'text-green-500'} />
                      <span className={product.stock < 10 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-black dark:text-white font-medium'}>
                        {product.stock} units
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-black dark:text-white font-bold">{product.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/products/edit/${product._id}`} className="text-blue-500 hover:text-blue-700">
                        <Edit2 size={18} />
                      </Link>
                      <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-serif italic text-lg">
                  No products found. Start by adding one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
