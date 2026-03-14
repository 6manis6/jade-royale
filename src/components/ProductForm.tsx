"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function ProductForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEdit = !!id;

  const [product, setProduct] = useState({
    name: '',
    price: 0,
    originalPrice: 0,
    category: 'Skincare',
    description: '',
    stock: 0,
    badge: '',
    images: [''],
    rating: 5,
    reviewCount: 0
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProduct(data.data);
          }
        });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/products/${id}` : '/api/products';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        router.push('/admin/products');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...product.images];
    newImages[index] = value;
    setProduct({ ...product, images: newImages });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-[var(--jade-text)]">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-3xl font-serif text-[var(--jade-text)]">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--jade-card)] p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Product Name *</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.name}
              onChange={(e) => setProduct({...product, name: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Price ($) *</label>
            <input 
              required
              type="number" 
              step="0.01"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.price}
              onChange={(e) => setProduct({...product, price: parseFloat(e.target.value)})}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Original Price ($)</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.originalPrice}
              onChange={(e) => setProduct({...product, originalPrice: parseFloat(e.target.value)})}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Category *</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.category}
              onChange={(e) => setProduct({...product, category: e.target.value})}
            >
              <option>Skincare</option>
              <option>Makeup</option>
              <option>Haircare</option>
              <option>Fragrance</option>
              <option>Clothing</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Initial Stock *</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.stock}
              onChange={(e) => setProduct({...product, stock: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Product Badge (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. SALE, NEW, HOT"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.badge}
              onChange={(e) => setProduct({...product, badge: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Star Rating (1-5)</label>
            <input 
              type="number" 
              min="1" max="5"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
              value={product.rating}
              onChange={(e) => setProduct({...product, rating: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
          <textarea 
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
            value={product.description}
            onChange={(e) => setProduct({...product, description: e.target.value})}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Product Images (URLs)</label>
          {product.images.map((img, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                type="text" 
                placeholder="https://..."
                className="flex-grow px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[var(--color-jade-pink)] outline-none text-[var(--jade-text)]"
                value={img}
                onChange={(e) => handleImageChange(idx, e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setProduct({...product, images: product.images.filter((_, i) => i !== idx)})}
                className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => setProduct({...product, images: [...product.images, '']})}
            className="text-[var(--color-jade-pink)] font-semibold text-sm hover:underline"
          >
            + Add another image URL
          </button>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[var(--color-jade-pink)] text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-3 disabled:bg-gray-400"
        >
          <Save size={20} />
          {loading ? 'Saving...' : 'Save Product Details'}
        </button>
      </form>
    </div>
  );
}
