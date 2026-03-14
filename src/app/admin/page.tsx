"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, ShoppingBag, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Products', value: '24', icon: ShoppingBag, change: '+2', trend: 'up' },
    { name: 'Active Orders', value: '12', icon: CreditCard, change: '+5', trend: 'up' },
    { name: 'Total Customers', value: '150', icon: Users, change: '+12%', trend: 'up' },
    { name: 'Revenue', value: '$2,450', icon: TrendingUp, change: '+18.5%', trend: 'up' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-serif text-black dark:text-white">Dashboard Overview</h2>
        <p className="text-black dark:text-gray-300 font-medium tracking-tight">Here's what's happening at Jade Royale today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-[var(--jade-card)] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-pink-50 dark:bg-pink-900/10 rounded-lg text-[var(--color-jade-pink)]">
                <stat.icon size={24} />
              </div>
              <span className={`flex items-center text-xs font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
                <ArrowUpRight size={12} className="ml-0.5" />
              </span>
            </div>
            <h3 className="text-black dark:text-gray-300 text-sm font-bold uppercase tracking-wider">{stat.name}</h3>
            <p className="text-3xl font-bold text-black dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Activity / Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--jade-card)] p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-black dark:text-white mb-6 uppercase tracking-wider">Recent Orders</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-50 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-black dark:text-white">#</div>
                  <div>
                    <p className="font-bold text-black dark:text-white">Order #JD-{1000 + i}</p>
                    <p className="text-xs text-black/60 dark:text-white/60 font-medium">2 minutes ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black dark:text-white">$120.00</p>
                  <span className="text-[10px] uppercase font-bold text-orange-500">Pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-[var(--jade-card)] p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-black dark:text-white mb-6 uppercase tracking-wider">Low Stock Alert</h3>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0"></div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-black dark:text-white">Hydrating Serum</p>
                  <p className="text-xs text-red-500 font-bold">Only 2 left</p>
                </div>
                <button className="text-xs text-[var(--color-jade-pink)] font-bold hover:underline">Restock</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
