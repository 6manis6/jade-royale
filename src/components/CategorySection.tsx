import Link from 'next/link';

const categories = [
  {
    name: 'Skincare',
    count: '8+ items',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
    color: 'from-pink-50 dark:from-pink-900/10 to-transparent'
  },
  {
    name: 'Makeup',
    count: '9+ items',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop',
    color: 'from-orange-50 dark:from-orange-900/10 to-transparent'
  },
  {
    name: 'Haircare',
    count: '2+ items',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400&auto=format&fit=crop',
    color: 'from-purple-50 dark:from-purple-900/10 to-transparent'
  },
  {
    name: 'Clothing',
    count: 'NEW',
    image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=400&auto=format&fit=crop',
    color: 'from-indigo-50 dark:from-indigo-900/10 to-transparent'
  }
];

export default function CategorySection() {
  return (
    <section className="py-24 bg-[var(--jade-bg)]">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-[var(--jade-text)] mb-4">Our Category</h2>
          <div className="w-24 h-1 bg-[var(--color-jade-pink)] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link href={`/shop?category=${cat.name}`} key={idx} className="group relative h-[450px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700">
              {/* Background Image - Full Stretch */}
              <div className="absolute inset-0">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                {/* Gradient Overlay for Text Visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end items-center text-center z-10">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 border border-white/30">
                  {cat.count}
                </span>
                <h3 className="font-serif text-3xl md:text-4xl text-white mb-6 group-hover:scale-105 transition-transform duration-500">
                  {cat.name}
                </h3>
                
                <div className="overflow-hidden">
                  <span className="text-white font-bold text-xs tracking-widest uppercase flex items-center gap-2 translate-y-20 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    Discover Collection
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
