import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { formatGHS } from '../hooks/useProducts';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="min-h-screen pt-32 pb-20 px-margin-edge bg-background">
      <div className="max-w-container-max mx-auto">
        <h1 className="font-bodoni text-headline-lg text-primary mb-2">Wishlist</h1>
        <p className="font-hanken text-xs text-on-surface-variant uppercase tracking-widest mb-10">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </p>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-[64px] text-primary mb-6 opacity-50">favorite</span>
            <p className="font-bodoni text-headline-md text-primary mb-4">Your wishlist is empty</p>
            <Link to="/collection" className="inline-block px-12 py-4 bg-primary text-white font-hanken text-label-sm uppercase tracking-widest hover:bg-secondary transition-colors duration-300">
              Discover Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <motion.div key={item.id} layout className="group">
                <Link to={`/collection/${item.slug}`} className="block">
                  <div className="aspect-[3/4] overflow-hidden bg-surface-container mb-4">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                  <h3 className="font-bodoni text-headline-sm text-primary mb-1">{item.title}</h3>
                  <p className="font-hanken text-label-sm text-secondary">{formatGHS(item.price)}</p>
                </Link>
                <button onClick={() => removeFromWishlist(item.id)} className="font-hanken text-[10px] text-red-400 uppercase tracking-widest mt-2 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none p-0">
                  Remove
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
