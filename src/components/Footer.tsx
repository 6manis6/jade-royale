import Link from 'next/link';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[var(--jade-card)] border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-gray-100 dark:border-gray-800 pb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-16 h-16 overflow-hidden transition-transform group-hover:scale-110">
                <Image 
                  src="/Jade Royale logo.png" 
                  alt="Jade Royale Logo" 
                  fill 
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="font-serif text-3xl font-semibold tracking-wide text-[var(--color-jade-pink)]">
                Jade Royale
              </span>
            </Link>
            <p className="text-black dark:text-gray-400 text-sm leading-relaxed mt-4 font-medium">
              Premium cosmetics and beauty products curated for the modern woman. Discover your unique glow with our exclusive collection of skincare, makeup, and fragrances.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] transition-colors"><Facebook size={20} /></a>
              <a href="https://www.instagram.com/jade.royale15/" target="_blank" rel="noopener noreferrer" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-bold text-black dark:text-white tracking-wider uppercase text-sm mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] text-sm font-medium transition-colors">Shop All</Link></li>
              <li><Link href="/shop?category=Skincare" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] text-sm font-medium transition-colors">Skincare</Link></li>
              <li><Link href="/shop?category=Makeup" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] text-sm font-medium transition-colors">Makeup</Link></li>
              <li><Link href="/shop?category=Haircare" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] text-sm font-medium transition-colors">Haircare</Link></li>
              <li><Link href="/shop?category=Fragrance" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] text-sm font-medium transition-colors">Fragrances</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-sans font-bold text-black dark:text-white tracking-wider uppercase text-sm mb-6">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link href="/track-order" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] text-sm font-medium transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] text-sm font-medium transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] text-sm font-medium transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] text-sm font-medium transition-colors">Shipping Info</Link></li>
              <li><Link href="/contact" className="text-black dark:text-gray-400 hover:text-[var(--color-jade-pink)] text-sm font-medium transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-sans font-bold text-black dark:text-white tracking-wider uppercase text-sm mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={18} className="text-[var(--color-jade-pink)] mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-black dark:text-gray-400 text-sm leading-relaxed font-medium">
                  Jade Royale Store<br/>
                  Birtamod, Jhapa<br/>
                  Nepal
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-[var(--color-jade-pink)] mr-3 flex-shrink-0" />
                <span className="text-black dark:text-gray-400 text-sm font-sans font-bold">+977 9800000000</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-[var(--color-jade-pink)] mr-3 flex-shrink-0" />
                <span className="text-black dark:text-gray-400 text-sm font-sans font-bold">hello@jaderoyale.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-black dark:text-gray-500 font-bold">
          <p>&copy; {new Date().getFullYear()} Jade Royale. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-[var(--color-jade-pink)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--color-jade-pink)] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
