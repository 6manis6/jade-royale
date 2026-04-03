"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, RefreshCcw } from "lucide-react";
import { formatPrice } from "@/lib/currency";

const statusOptions = [
  "Pending",
  "Processing",
  "Paid",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

type OrderStatus = (typeof statusOptions)[number];

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "cod" | "esewa";
  createdAt: string;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
}

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-blue-100 text-blue-700",
  Paid: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-sky-100 text-sky-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;
      const target = [
        order._id,
        order.customer?.name,
        order.customer?.phone,
        order.customer?.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = target.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? data.data : order)),
        );
      } else {
        alert(data.error || "Failed to update order status");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Delete this order? This cannot be undone.")) {
      return;
    }
    setDeletingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
      } else {
        alert(data.error || "Failed to delete order");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--jade-muted)] font-semibold">
            Orders
          </p>
          <h2 className="text-3xl font-serif text-[var(--jade-text)] mt-2">
            Manage Orders
          </h2>
          <p className="text-[var(--jade-muted)] font-medium tracking-tight mt-2">
            Review orders, update status, and remove cancelled entries.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--jade-border)] text-sm font-semibold text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] hover:border-[var(--color-jade-pink)] transition-colors"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="bg-[var(--jade-card)] p-4 rounded-2xl border border-[var(--jade-border)] shadow-sm flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by name, phone, city, or ID..."
            className="w-full pl-4 pr-4 py-2 bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-jade-pink)] text-[var(--jade-text)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded-xl px-4 py-2 text-sm text-[var(--jade-text)]"
        >
          <option value="All">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-[var(--jade-card)] rounded-2xl border border-[var(--jade-border)] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--jade-bg)] border-b border-[var(--jade-border)]">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Order
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Customer
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Items
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Total
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Payment
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--jade-text)]">
                Status
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
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-8 bg-[var(--jade-bg)] rounded"></div>
                  </td>
                </tr>
              ))
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-[var(--jade-bg)]/70 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-[var(--jade-text)] uppercase text-sm tracking-wide">
                      #{order._id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-xs text-[var(--jade-muted)] mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--jade-text)]">
                    <div className="font-semibold">
                      {order.customer?.name || "Unnamed"}
                    </div>
                    <div className="text-xs text-[var(--jade-muted)]">
                      {order.customer?.phone || "No phone"}
                    </div>
                    <div className="text-xs text-[var(--jade-muted)]">
                      {(order.customer?.city || "") +
                        (order.customer?.address
                          ? `, ${order.customer.address}`
                          : "")}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--jade-text)]">
                    <div className="font-semibold">
                      {order.items?.length || 0} items
                    </div>
                    <div className="text-xs text-[var(--jade-muted)]">
                      {(order.items || [])
                        .slice(0, 2)
                        .map((item) => item.name)
                        .join(", ")}
                      {(order.items || []).length > 2 ? "..." : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--jade-text)]">
                    {formatPrice(order.totalAmount || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--jade-text)] uppercase">
                    {order.paymentMethod}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[10px] uppercase font-semibold ${statusStyles[order.status]}`}
                    >
                      {order.status}
                    </div>
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) =>
                        handleStatusChange(
                          order._id,
                          e.target.value as OrderStatus,
                        )
                      }
                      className="mt-2 w-full bg-[var(--jade-bg)] border border-[var(--jade-border)] rounded-lg px-2 py-1 text-xs text-[var(--jade-text)]"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(order._id)}
                      disabled={deletingId === order._id}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <p className="text-sm text-[var(--jade-muted)]">
                    No orders found.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
