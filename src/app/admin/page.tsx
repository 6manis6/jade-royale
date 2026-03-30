"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  CreditCard,
  Users,
  TrendingUp,
  AlertCircle,
  Package,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  stock: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customer?: {
    name?: string;
    phone?: string;
  };
}

const formatMoney = (value: number) =>
  `Rs ${value.toLocaleString("en-IN")}`;

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-blue-100 text-blue-700",
  Paid: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-sky-100 text-sky-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/orders"),
        ]);

        const productsJson = await productsRes.json();
        const ordersJson = await ordersRes.json();

        if (productsJson.success) {
          setProducts(productsJson.data);
        }
        if (ordersJson.success) {
          setOrders(ordersJson.data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeOrders = orders.filter((order) =>
      ["Pending", "Processing", "Paid"].includes(order.status),
    ).length;
    const totalCustomers = new Set(
      orders.map((order) => order.customer?.phone).filter(Boolean),
    ).size;
    const revenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );

    return [
      {
        name: "Total Products",
        value: totalProducts,
        icon: ShoppingBag,
        helper: "Live inventory count",
      },
      {
        name: "Active Orders",
        value: activeOrders,
        icon: CreditCard,
        helper: "Pending and in progress",
      },
      {
        name: "Customers",
        value: totalCustomers,
        icon: Users,
        helper: "Unique phone numbers",
      },
      {
        name: "Revenue",
        value: formatMoney(revenue),
        icon: TrendingUp,
        helper: "All time gross",
      },
    ];
  }, [orders, products]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const lowStock = useMemo(
    () => products.filter((product) => product.stock <= 5).slice(0, 5),
    [products],
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3">
        <p className="uppercase tracking-[0.35em] text-xs text-[var(--jade-muted)] font-semibold">
          Admin Control Room
        </p>
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-serif text-[var(--jade-text)]">
            Dashboard Overview
          </h2>
          <p className="text-[var(--jade-muted)] font-medium max-w-2xl">
            Track inventory, orders, and revenue without the placeholder
            numbers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-[var(--jade-card)] p-6 rounded-2xl border border-[var(--jade-border)] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--jade-muted)] font-semibold">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-[var(--jade-text)] mt-3">
                  {loading ? "--" : stat.value}
                </p>
                <p className="text-xs text-[var(--jade-muted)] mt-3">
                  {stat.helper}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-900/10 text-[var(--color-jade-pink)]">
                <stat.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)] gap-6">
        <div className="bg-[var(--jade-card)] p-8 rounded-2xl border border-[var(--jade-border)] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--jade-muted)] font-semibold">
                Orders
              </p>
              <h3 className="text-xl font-semibold text-[var(--jade-text)] mt-2">
                Recent Orders
              </h3>
            </div>
            <span className="text-xs text-[var(--jade-muted)]">
              {loading ? "Loading" : `${orders.length} total`}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-[var(--jade-bg)] animate-pulse"
                />
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--jade-border)] bg-[var(--jade-bg)]/70"
                >
                  <div>
                    <p className="font-semibold text-[var(--jade-text)]">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-[var(--jade-muted)] mt-1">
                      {order.customer?.name || "Unnamed"} ·{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-semibold text-[var(--jade-text)]">
                      {formatMoney(order.totalAmount || 0)}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-1 rounded-full ${statusStyles[order.status] || "bg-[var(--jade-bg)] text-[var(--jade-muted)]"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-[var(--jade-muted)]">
              <AlertCircle size={18} />
              No orders yet. Orders will appear here as soon as customers check
              out.
            </div>
          )}
        </div>

        <div className="bg-[var(--jade-card)] p-8 rounded-2xl border border-[var(--jade-border)] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--jade-muted)] font-semibold">
                Inventory
              </p>
              <h3 className="text-xl font-semibold text-[var(--jade-text)] mt-2">
                Low Stock Alerts
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-[var(--jade-bg)] animate-pulse"
                />
              ))}
            </div>
          ) : lowStock.length > 0 ? (
            <div className="space-y-4">
              {lowStock.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-900/10 text-[var(--color-jade-pink)]">
                      <Package size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--jade-text)]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[var(--jade-muted)]">
                        Only {product.stock} left
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-rose-500">
                    Restock
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[var(--jade-muted)]">
              Inventory looks healthy. No low stock items right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
