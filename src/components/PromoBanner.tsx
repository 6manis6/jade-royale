import Link from 'next/link';

export default function PromoBanner() {
  return (
    <section className="py-16 bg-[var(--jade-bg)] overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="bg-[var(--color-jade-blush)] dark:bg-pink-950/30 rounded-[40px] relative flex flex-col md:flex-row items-center justify-between p-10 md:p-16 overflow-hidden min-h-[400px] border border-transparent dark:border-pink-900/50">
          
          {/* Background Decorations */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[var(--jade-card)]/40 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[var(--color-jade-pink)]/10 blur-3xl rounded-full"></div>
          
          <div className="w-full md:w-1/2 relative z-10 flex justify-center mb-10 md:mb-0">
            <div className="relative w-full max-w-md h-64 md:h-80 group">
              {/* Note: since this is just UI mimicking the reference, we use a placeholder image that matches the "cosmetic cream packs" vibe */}
              <div className="absolute inset-0 bg-[var(--jade-card)]/20 backdrop-blur-sm rounded-3xl scale-105 transform group-hover:scale-110 transition-transform duration-700"></div>
              <img 
                src="https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=800&auto=format&fit=crop" 
                alt="Cosmetic Packs" 
                className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl group-hover:rotate-1 transition-transform duration-500"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 relative z-10 md:pl-10 space-y-6">
            <p className="text-gray-600 dark:text-gray-400 font-serif text-lg italic tracking-wi">A nature's touch</p>
            <h2 className="font-serif text-5xl md:text-6xl text-[var(--jade-text)] leading-tight">
              <span className="text-[var(--color-jade-pink)] font-semibold">Get 20%</span> off on all <br/>
              cosmetic cream <br/>
              packs
            </h2>
            <p className="text-[var(--jade-text)] font-medium opacity-80">Start from <span className="text-[var(--color-jade-pink)] font-bold text-xl">$80.00</span></p>
            
            <div className="pt-4">
              <Link href="/shop" className="btn-primary inline-flex items-center">
                Browse Product
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
