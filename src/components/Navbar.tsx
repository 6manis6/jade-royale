"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, User, Search, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? "bg-[var(--jade-card)]/95 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-5"}`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-12 h-12 md:w-16 md:h-16 overflow-hidden">
              <Image
                src="/Jade Royale logo.png"
                alt="Jade Royale Logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="font-serif text-2xl md:text-3xl font-semibold tracking-wide text-[var(--color-jade-pink)] group-hover:opacity-80 transition-opacity">
              Jade Royale
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold text-sm tracking-widest uppercase transition-colors"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold text-sm tracking-widest uppercase transition-colors"
            >
              Product
            </Link>
            <Link
              href="/shop?category=Skincare"
              className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold text-sm tracking-widest uppercase transition-colors"
            >
              Skincare
            </Link>
            <Link
              href="/shop?category=Makeup"
              className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold text-sm tracking-widest uppercase transition-colors"
            >
              Makeup
            </Link>
            <Link
              href="/shop?category=Clothing"
              className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold text-sm tracking-widest uppercase transition-colors"
            >
              Clothing
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-3 md:space-x-5">
            <ThemeToggle />

            {/* Functional Search */}
            <div className="relative group flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="w-0 group-focus-within:w-40 md:group-hover:w-48 transition-all duration-500 bg-[var(--jade-bg)] border-b border-[var(--color-jade-pink)] outline-none px-2 py-1 text-sm text-[var(--jade-text)] opacity-0 group-focus-within:opacity-100 md:group-hover:opacity-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    window.location.href = `/shop?q=${(e.target as HTMLInputElement).value}`;
                  }
                }}
              />
              <button className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] transition-colors p-1">
                <Search size={22} strokeWidth={2.5} />
              </button>
            </div>

            <button
              className="relative text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] transition-colors"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={24} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-jade-pink)] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {status === "authenticated" ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-xs text-[var(--jade-muted)] max-w-[140px] truncate">
                  {session?.user?.name || session?.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center gap-1 text-[var(--jade-text)] hover:text-[var(--color-jade-pink)]"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-semibold">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[var(--jade-text)] hover:text-[var(--color-jade-pink)]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold bg-[var(--color-jade-pink)] text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              className="md:hidden text-[var(--jade-text)] ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[var(--jade-card)] border-t border-gray-100 dark:border-gray-800 shadow-lg py-4 px-6 flex flex-col space-y-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold uppercase text-sm"
          >
            Home
          </Link>
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold uppercase text-sm"
          >
            Shop All
          </Link>
          <Link
            href="/shop?category=Skincare"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold uppercase text-sm"
          >
            Skincare
          </Link>
          <Link
            href="/shop?category=Makeup"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold uppercase text-sm"
          >
            Makeup
          </Link>
          <Link
            href="/shop?category=Clothing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold uppercase text-sm"
          >
            Clothing
          </Link>
          {status === "authenticated" ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="text-left text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold uppercase text-sm inline-flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold uppercase text-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[var(--jade-text)] hover:text-[var(--color-jade-pink)] font-bold uppercase text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
