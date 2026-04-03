"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Package,
  ArrowLeft,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinkBase =
    "flex items-center gap-3 p-3 rounded-xl transition-colors font-medium";
  const navLinkActive =
    "bg-pink-50/70 dark:bg-pink-900/10 text-[var(--color-jade-pink)]";
  const navLinkIdle =
    "text-[var(--jade-text)] hover:bg-pink-50/70 dark:hover:bg-pink-900/10 hover:text-[var(--color-jade-pink)]";
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    }
    router.push("/admin/login");
    router.refresh();
  };

  useEffect(() => {
    const verifySession = async () => {
      if (pathname === "/admin/login") {
        setIsAuthenticated(true);
        setCheckingSession(false);
        return;
      }

      setCheckingSession(true);
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        const data = await res.json();

        if (res.ok && data?.authenticated) {
          setIsAuthenticated(true);
          setCheckingSession(false);
          return;
        }
      } catch (err) {
        console.error(err);
      }

      setIsAuthenticated(false);
      setCheckingSession(false);
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    };

    verifySession();
  }, [pathname, router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--jade-bg)] text-[var(--jade-text)]">
        <p className="text-sm uppercase tracking-[0.25em] text-[var(--jade-muted)]">
          Verifying Access...
        </p>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== "/admin/login") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(233,30,140,0.08),_transparent_55%)] bg-[var(--jade-bg)] flex">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 h-screen overflow-y-auto bg-[var(--jade-card)] border-r border-[var(--jade-border)] transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"} flex flex-col z-20 shrink-0`}
      >
        <div className="p-6 flex items-center justify-between border-b border-[var(--jade-border)]">
          <Link
            href="/admin"
            className={`font-serif text-xl font-bold text-[var(--color-jade-pink)] transition-opacity ${isSidebarOpen ? "opacity-100" : "opacity-0 invisible w-0"}`}
          >
            Jade Admin
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <Link
            href="/admin"
            className={`${navLinkBase} ${isActive("/admin") ? navLinkActive : navLinkIdle}`}
          >
            <LayoutDashboard size={20} />
            <span className={`${!isSidebarOpen && "hidden"}`}>Dashboard</span>
          </Link>
          <Link
            href="/admin/products"
            className={`${navLinkBase} ${isActive("/admin/products") ? navLinkActive : navLinkIdle}`}
          >
            <ShoppingBag size={20} />
            <span className={`${!isSidebarOpen && "hidden"}`}>Products</span>
          </Link>
          <Link
            href="/admin/orders"
            className={`${navLinkBase} ${isActive("/admin/orders") ? navLinkActive : navLinkIdle}`}
          >
            <Package size={20} />
            <span className={`${!isSidebarOpen && "hidden"}`}>Orders</span>
          </Link>
          <Link
            href="/admin/settings"
            className={`${navLinkBase} ${isActive("/admin/settings") ? navLinkActive : navLinkIdle}`}
          >
            <Settings size={20} />
            <span className={`${!isSidebarOpen && "hidden"}`}>
              Slider Settings
            </span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[var(--jade-border)]">
          <Link
            href="/"
            className="flex items-center gap-3 p-3 rounded-xl text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] transition-colors font-bold text-sm uppercase tracking-wider"
          >
            <ArrowLeft size={20} />
            <span className={`${!isSidebarOpen && "hidden"}`}>
              Back to Store
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        <header className="bg-[var(--jade-card)]/90 backdrop-blur-md border-b border-[var(--jade-border)] p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-[var(--jade-text)] uppercase tracking-widest font-sans">
              Admin Panel
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--jade-muted)] italic font-medium">
                Welcome, Jade Royale
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
