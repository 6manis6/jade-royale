export default function GallerySection() {
  const images = [
    "/instagram/post1.png",
    "/instagram/post2.png",
    "/instagram/post3.png",
    "/instagram/post4.png",
    "/instagram/post5.png",
    "/instagram/post6.png",
    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=500&auto=format&fit=crop",
  ];

  return (
    <section className="py-24 bg-[var(--jade-bg)] border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <a
            href="https://www.instagram.com/jade.royale15/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block group text-center"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--jade-text)] mb-4 tracking-widest uppercase group-hover:text-[var(--color-jade-pink)] transition-colors">
              Instagram
            </h2>
            <p className="text-sm text-[var(--jade-text)] font-bold tracking-wide group-hover:text-[var(--color-jade-pink)] transition-colors">
              @jade.royale15
            </p>
          </a>
          <div className="w-16 h-1 bg-[var(--color-jade-pink)] mx-auto rounded-full mt-4"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <a
              href="https://www.instagram.com/jade.royale15/"
              target="_blank"
              rel="noopener noreferrer"
              key={index}
              className="relative group overflow-hidden aspect-square rounded-sm block"
            >
              <img
                src={src}
                alt={`Instagram gallery ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
