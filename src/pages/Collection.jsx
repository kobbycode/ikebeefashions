import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts, formatGHS } from '../hooks/useProducts';
import LazyImage from '../components/LazyImage';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e) => {
      if (e.target.closest('.product-card')) setIsHovering(true);
      else setIsHovering(false);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-12 h-12 border border-secondary rounded-full pointer-events-none z-[100] flex items-center justify-center mix-blend-difference hidden md:flex"
      animate={{
        x: mousePosition.x - 24,
        y: mousePosition.y - 24,
        scale: isHovering ? 2 : 1,
        opacity: isHovering ? 1 : 0,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.5 }}
    >
      {isHovering && (
        <span className="text-[8px] text-white uppercase tracking-tighter font-hanken">View</span>
      )}
    </motion.div>
  );
};

const Collection = () => {
  const { products } = useProducts();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    if (filter !== 'All' && p.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match = p.title?.toLowerCase().includes(q) || p.tag?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="pt-32 pb-section-gap bg-background min-h-screen">
      <CustomCursor />

      {/* Editorial Header */}
      <section className="px-margin-edge max-w-container-max mx-auto mb-20 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-hanken text-label-sm text-secondary uppercase tracking-[0.4em] mb-4 block"
        >
          Volume {new Date().getFullYear()}
        </motion.span>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-bodoni text-display-xl text-primary mb-8"
        >
          The Discovery Collection
        </motion.h1>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent border border-primary/20 pl-12 pr-4 py-3 text-primary text-sm focus:outline-none focus:border-secondary transition-colors font-hanken"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-6 border-b border-primary/10 pb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`font-hanken text-label-sm uppercase tracking-widest transition-all duration-300 relative ${
                filter === cat ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {cat}
              {filter === cat && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute -bottom-8 left-0 right-0 h-[1px] bg-secondary"
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Asymmetric Grid */}
      <section className="px-margin-edge max-w-container-max mx-auto">
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-12 gap-gutter auto-rows-[minmax(300px,auto)]"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className={`${product.span} product-card group relative`}
              >
                <Link to={`/collection/${product.slug}`} className="block w-full h-full">
                  <div className="relative w-full h-full overflow-hidden bg-surface-container">
                    {/* Primary Image */}
                    <LazyImage
                      src={product.img}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      {product.isNew && (
                        <span className="bg-secondary text-white text-[10px] uppercase tracking-widest px-3 py-1 font-hanken">New</span>
                      )}
                      {product.tag && (
                        <span className="bg-primary/80 text-white text-[10px] uppercase tracking-widest px-3 py-1 font-hanken">{product.tag}</span>
                      )}
                      {product.totalStock === 0 && (
                        <span className="bg-red-600 text-white text-[10px] uppercase tracking-widest px-3 py-1 font-hanken">Sold Out</span>
                      )}
                      {(product.totalStock > 0 && product.totalStock <= 5) && (
                        <span className="bg-amber-600 text-white text-[10px] uppercase tracking-widest px-3 py-1 font-hanken">Only {product.totalStock} left</span>
                      )}
                    </div>

                    {/* Detail Image on hover — cycles through gallery */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                      <LazyImage
                        src={product.detailImg || (product.galleryImgs?.length > 1 ? product.galleryImgs[1] : product.galleryImgs?.[0]) || product.img}
                        alt="Detail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
                    </div>

                    {/* Info Overlay — always visible on mobile, slides up on hover on desktop */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 z-20">
                      <div className="bg-white/90 backdrop-blur-md p-4 md:p-5">
                        <div className="flex justify-between items-end mb-1">
                          <span className="font-hanken text-[10px] uppercase tracking-widest text-secondary">
                            {product.category}
                          </span>
                          <span className="font-hanken text-label-sm text-primary">{formatGHS(product.price)}</span>
                        </div>
                        <h4 className="font-bodoni text-headline-sm text-primary">{product.title}</h4>
                        <div className="flex gap-2 mt-3">
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); import('../pages/Compare').then(m => m.addToCompare(product)); }} className="flex-1 py-2.5 border border-primary/50 text-primary/80 font-hanken text-[10px] tracking-widest text-center hover:bg-primary hover:text-white transition-all uppercase">
                            Compare
                          </button>
                          <Link to={`/collection/${product.slug || product.id}`} className="flex-1 py-2.5 border border-primary text-primary font-hanken text-[10px] tracking-widest text-center hover:bg-primary hover:text-white transition-all uppercase">
                            <span className="md:hidden">View</span>
                            <span className="hidden md:inline">View →</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <p className="font-bodoni text-headline-md text-on-surface-variant italic">
              More pieces coming soon to the {filter} category.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Collection;
