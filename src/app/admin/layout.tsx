"use client";

import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Settings, Package, ArrowLeft, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--jade-bg)] flex">
      {/* Sidebar */}
      <aside className={`bg-[var(--jade-card)] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <Link href="/admin" className={`font-serif text-xl font-bold text-[var(--color-jade-pink)] transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 invisible w-0'}`}>
            Jade Admin
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-black dark:text-white hover:text-[var(--color-jade-pink)] transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg text-black dark:text-white hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:text-[var(--color-jade-pink)] transition-colors font-medium">
            <LayoutDashboard size={20} />
            <span className={`${!isSidebarOpen && 'hidden'}`}>Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:text-[var(--color-jade-pink)] transition-colors text-[var(--color-jade-pink)] bg-pink-50/50 dark:bg-pink-900/10">
            <ShoppingBag size={20} />
            <span className={`${!isSidebarOpen && 'hidden'}`}>Products</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-lg text-black dark:text-white hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:text-[var(--color-jade-pink)] transition-colors font-medium">
            <Settings size={20} />
            <span className={`${!isSidebarOpen && 'hidden'}`}>Slider Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-3 p-3 rounded-lg text-black dark:text-white hover:text-[var(--color-jade-pink)] transition-colors font-bold text-sm uppercase tracking-wider">
            <ArrowLeft size={20} />
            <span className={`${!isSidebarOpen && 'hidden'}`}>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        <header className="bg-[var(--jade-card)] border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-black dark:text-white uppercase tracking-widest font-sans">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-black dark:text-white italic font-medium">Welcome, Jade Royale</span>
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
