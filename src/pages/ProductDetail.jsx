import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts, formatGHS } from '../hooks/useProducts';
import { db } from '../services/api';
import { collection, addDoc, query, where, getDocs, orderBy as fbOrderBy, serverTimestamp } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import LazyImage from '../components/LazyImage';
import { useAlert } from '../context/AlertContext';
import { useWishlist } from '../context/WishlistContext';
import { addToCompare } from './Compare';
import { Helmet } from 'react-helmet-async';

const ProductDetail = () => {
  const { slug } = useParams();
  const { products, getProductBySlug, loading } = useProducts();
  const product = getProductBySlug(slug);

  const { showAlert } = useAlert();
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    const q = query(collection(db, 'reviews'), where('productId', '==', product.id), fbOrderBy('createdAt', 'desc'));
    getDocs(q).then(snap => setReviews(snap.docs.map(d => d.data())));
  }, [product?.id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;
    setReviewLoading(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: product.id,
        name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: serverTimestamp(),
      });
      setReviewSubmitted(true);
      setReviewForm({ name: '', rating: 5, comment: '' });
    } catch { /* empty */ } finally { setReviewLoading(false); }
  };
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-6">
        <p className="font-bodoni text-headline-lg text-primary italic">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-6">
        <p className="font-bodoni text-headline-lg text-primary italic">Product not found.</p>
        <Link to="/collection" className="font-hanken text-label-sm text-primary border-b border-primary pb-1">
          Back to Collection
        </Link>
      </div>
    );
  }

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      await showAlert('Please select a size before adding to your bag.', 'warning', 'Size Required');
      return;
    }
    
    // Parse price string to number for cart calculations (handles "GHS 4,500" format)
    const numericPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, ""));

    addToCart({
      id: `${product.id}-${selectedSize}`, // Make id unique by size
      productId: product.id,
      name: product.title,
      price: numericPrice || 0,
      image: product.img || product.galleryImgs[0],
      category: product.category,
      size: selectedSize
    });
    
    // Open the cart sidebar
    setIsCartOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>{product.metaTitle || product.title} | IKEBEE</title>
        <meta name="description" content={product.metaDescription || (product.details?.slice(0, 160) || `${product.title} — IKEBEE Luxury Fashion`)} />
        <meta property="og:title" content={product.metaTitle || product.title} />
        <meta property="og:description" content={product.metaDescription || (product.details?.slice(0, 160) || `${product.title} — IKEBEE Luxury Fashion`)} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
      </Helmet>
      <div className="bg-background pt-24 pb-section-gap overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-margin-edge max-w-container-max mx-auto mb-12 flex items-center gap-3">
        <Link to="/collection" className="font-hanken text-label-sm text-on-surface-variant hover:text-primary transition-colors">
          Collection
        </Link>
        <span className="text-on-surface-variant/40">—</span>
        <span className="font-hanken text-label-sm text-secondary">{product.category}</span>
        <span className="text-on-surface-variant/40">—</span>
        <span className="font-hanken text-label-sm text-primary">{product.title}</span>
      </div>

      {/* Main Product Layout */}
      <section className="px-margin-edge max-w-container-max mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-16 items-start">

          {/* Gallery Column */}
          <div className="lg:col-span-7">
            {/* Main Image */}
            <motion.div
              key={activeImg}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="aspect-[3/4] overflow-hidden mb-4 bg-surface-container relative"
            >
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-secondary text-white text-[10px] uppercase tracking-widest px-3 py-1 font-hanken">New</span>
                )}
                {product.tag && (
                  <span className="bg-primary/80 text-white text-[10px] uppercase tracking-widest px-3 py-1 font-hanken">{product.tag}</span>
                )}
              </div>
              <button onClick={() => setShowLightbox(true)} className="w-full h-full cursor-zoom-in">
                <LazyImage
                  src={product.galleryImgs[activeImg]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </button>
            </motion.div>

            {/* Thumbnail Strip */}
            <div className="flex gap-3">
              {product.galleryImgs.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-1 aspect-square overflow-hidden border-2 transition-all duration-300 ${
                    activeImg === i ? 'border-secondary' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <LazyImage src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
              {showLightbox && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
                  onClick={() => setShowLightbox(false)}
                >
                  <button onClick={() => setShowLightbox(false)} className="absolute top-6 right-6 text-white/60 hover:text-white z-10 transition-colors">
                    <span className="material-symbols-outlined text-3xl">close</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg((prev) => (prev > 0 ? prev - 1 : product.galleryImgs.length - 1)); }} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10 transition-colors">
                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg((prev) => (prev < product.galleryImgs.length - 1 ? prev + 1 : 0)); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10 transition-colors">
                    <span className="material-symbols-outlined text-3xl">chevron_right</span>
                  </button>
                  <motion.img
                    key={activeImg}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={product.galleryImgs[activeImg]}
                    alt={product.title}
                    className="max-w-full max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.galleryImgs.map((_, i) => (
                      <button key={i} onClick={() => setActiveImg(i)} className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-white w-6' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Product Info Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Type & Season badge */}
              <div className="flex gap-3 mb-4 flex-wrap">
                {product.isNew && (
                  <span className="font-hanken text-[10px] tracking-widest uppercase text-white bg-secondary px-3 py-1">
                    New
                  </span>
                )}
                <span className="font-hanken text-[10px] tracking-widest uppercase text-secondary border border-secondary px-3 py-1">
                  {product.type}
                </span>
                {product.season && (
                  <span className="font-hanken text-[10px] tracking-widest uppercase text-on-surface-variant border border-primary/20 px-3 py-1">
                    {product.season}
                  </span>
                )}
                {product.tag && (
                  <span className="font-hanken text-[10px] tracking-widest uppercase text-[#C5A880] border border-[#C5A880]/40 px-3 py-1">
                    {product.tag}
                  </span>
                )}
                {product.totalStock === 0 && (
                  <span className="font-hanken text-[10px] tracking-widest uppercase text-white bg-red-600 px-3 py-1">Sold Out</span>
                )}
                {(product.totalStock > 0 && product.totalStock <= 5) && (
                  <span className="font-hanken text-[10px] tracking-widest uppercase text-white bg-amber-600 px-3 py-1">Only {product.totalStock} left</span>
                )}
              </div>

              <h1 className="font-bodoni text-headline-lg text-primary mb-3 leading-tight">{product.title}</h1>
              <p className="font-hanken text-label-sm text-secondary uppercase tracking-widest mb-6">{product.category}</p>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-bodoni text-headline-md text-primary">{formatGHS(product.price)}</span>
              </div>

              <div className="w-full h-[1px] bg-primary/10 mb-8"></div>

              {/* Description */}
              <p className="font-hanken text-body-md text-on-surface-variant leading-relaxed mb-8">
                {product.description}
              </p>

              {product.artisan && (
                <div className="flex items-center gap-3 mb-8 py-4 border-y border-primary/10">
                  <span className="material-symbols-outlined text-secondary text-sm">handshake</span>
                  <p className="font-hanken text-label-sm text-on-surface-variant italic">{product.artisan}</p>
                </div>
              )}

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div className="mb-8">
                  <span className="font-hanken text-label-sm text-primary uppercase tracking-widest mb-4 block">Color: {selectedColor || 'Select'}</span>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`px-5 py-2.5 font-hanken text-[10px] tracking-widest uppercase border transition-all duration-300 ${
                          selectedColor === color.name
                            ? 'bg-primary text-on-primary border-primary'
                            : 'border-primary/20 text-primary hover:border-primary'
                        }`}
                      >
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-hanken text-label-sm text-primary uppercase tracking-widest">Select Size</span>
                  <button onClick={() => setShowSizeGuide(true)} className="font-hanken text-label-sm text-secondary underline underline-offset-2 cursor-pointer">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => {
                    const sizeName = typeof size === 'string' ? size : size.name;
                    const sizeStock = typeof size === 'object' ? (Number(size.stock) || 0) : product.totalStock;
                    const outOfStock = sizeStock === 0;
                    return (
                      <button
                        key={sizeName}
                        disabled={outOfStock}
                        onClick={() => !outOfStock && setSelectedSize(sizeName)}
                        className={`px-5 py-2.5 font-hanken text-[10px] tracking-widest uppercase border transition-all duration-300 ${
                          outOfStock ? 'border-primary/10 text-primary/30 line-through cursor-not-allowed' :
                          selectedSize === sizeName
                            ? 'bg-primary text-on-primary border-primary'
                            : 'border-primary/20 text-primary hover:border-primary'
                        }`}
                        title={outOfStock ? 'Out of stock' : `${sizeStock} in stock`}
                      >
                        {sizeName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wishlist + CTA */}
              <div className="flex gap-3 mb-4">
                <motion.button
                  onClick={() => toggleWishlist(product)}
                  whileHover={{ scale: 1.05 }}
                  className={`px-5 py-5 border font-hanken text-label-sm tracking-widest transition-colors duration-300 flex items-center justify-center ${
                    isInWishlist(product.id)
                      ? 'bg-red-500/10 border-red-500 text-red-400'
                      : 'border-primary/20 text-primary hover:border-primary'
                  }`}
                  title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <span className="material-symbols-outlined">{isInWishlist(product.id) ? 'favorite' : 'favorite_border'}</span>
                </motion.button>
                <motion.button
                  onClick={() => addToCompare(product)}
                  whileHover={{ scale: 1.05 }}
                  className="w-14 h-14 flex items-center justify-center border border-primary/20 text-primary hover:border-primary transition-colors"
                  title="Compare"
                >
                  <span className="material-symbols-outlined text-lg">compare_arrows</span>
                </motion.button>
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ backgroundColor: '#C5A059' }}
                  className="flex-1 py-5 bg-primary text-on-primary font-hanken text-label-sm tracking-[0.3em] transition-colors duration-500"
                >
                  ADD TO CART
                </motion.button>
              </div>

              <Link
                to="/bespoke"
                className="block w-full py-4 border border-primary text-primary text-center font-hanken text-label-sm tracking-widest hover:bg-primary hover:text-on-primary transition-colors duration-500"
              >
                COMMISSION BESPOKE VERSION
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Material Details Section */}
      <section className="px-margin-edge max-w-container-max mx-auto mt-section-gap border-t border-primary/10 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div>
            <h3 className="font-bodoni text-headline-md text-primary mb-6">Materials & Care</h3>
            <ul className="space-y-3">
              {product.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-4 h-[1px] bg-secondary mt-3 flex-shrink-0"></span>
                  <span className="font-hanken text-body-md text-on-surface-variant">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:pl-16 md:border-l border-primary/10">
            <h3 className="font-bodoni text-headline-md text-primary mb-6">The IKEBEE Promise</h3>
            <div className="space-y-6">
              {[
                { icon: 'handshake', label: 'Fair Artisan Wages', desc: 'Every maker receives above-market compensation.' },
                { icon: 'eco', label: 'Ethical Sourcing', desc: 'All materials are responsibly sourced within Ghana.' },
                { icon: 'workspace_premium', label: 'Authenticity Guaranteed', desc: 'Each piece comes with a certificate of provenance.' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-secondary">{icon}</span>
                  <div>
                    <p className="font-hanken text-label-sm text-primary uppercase tracking-widest mb-1">{label}</p>
                    <p className="font-hanken text-body-md text-on-surface-variant">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="px-margin-edge max-w-container-max mx-auto mt-section-gap">
          <div className="flex justify-between items-end mb-12">
            <h3 className="font-bodoni text-headline-md text-primary">You May Also Like</h3>
            <Link to="/collection" className="font-hanken text-label-sm text-secondary border-b border-secondary pb-1 hover:text-primary hover:border-primary transition-all">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-gutter">
            {related.map((item) => (
              <Link key={item.id} to={`/collection/${item.slug}`} className="group">
                <div className="aspect-[3/4] overflow-hidden mb-4 bg-surface-container">
                  <LazyImage
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h4 className="font-bodoni text-headline-sm text-primary mb-1">{item.title}</h4>
                <p className="font-hanken text-label-sm text-secondary">{formatGHS(item.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="px-margin-edge max-w-container-max mx-auto mt-section-gap border-t border-primary/10 pt-16">
        <h3 className="font-bodoni text-headline-md text-primary mb-8">Customer Reviews</h3>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {reviews.map((r, i) => (
              <div key={i} className="border border-primary/10 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-secondary text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="font-hanken text-xs text-primary font-semibold">{r.name}</span>
                </div>
                <p className="font-hanken text-body-md text-on-surface-variant">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-hanken text-body-md text-on-surface-variant mb-12">No reviews yet. Be the first!</p>
        )}
        {reviewSubmitted ? (
          <p className="font-hanken text-xs text-green-400 uppercase tracking-widest">Thank you for your review!</p>
        ) : (
          <form onSubmit={handleSubmitReview} className="max-w-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input type="text" required value={reviewForm.name} onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="w-full bg-transparent border border-primary/20 p-4 text-primary text-sm focus:outline-none focus:border-secondary font-hanken" />
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: s }))} className={`text-lg cursor-pointer bg-transparent border-none p-0 ${s <= reviewForm.rating ? 'text-secondary' : 'text-primary/20'}`}>★</button>
                ))}
              </div>
            </div>
            <textarea required value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} placeholder="Write your review..." rows="3" className="w-full bg-transparent border border-primary/20 p-4 text-primary text-sm focus:outline-none focus:border-secondary font-hanken resize-none mb-4" />
            <button type="submit" disabled={reviewLoading} className="px-8 py-3 bg-primary text-white font-hanken text-xs uppercase tracking-widest hover:bg-secondary transition-colors disabled:opacity-50">{reviewLoading ? 'Submitting...' : 'Submit Review'}</button>
          </form>
        )}
      </section>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowSizeGuide(false)} className="absolute top-4 right-4 text-primary/50 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>

              <h2 className="font-bodoni text-headline-md text-primary mb-6">Size Guide</h2>

              <div className="overflow-x-auto mb-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-primary/20 text-primary/60 text-[10px] uppercase tracking-widest">
                      <th className="pb-3 pr-4 font-hanken">Size</th>
                      <th className="pb-3 pr-4 font-hanken">Bust (cm)</th>
                      <th className="pb-3 pr-4 font-hanken">Waist (cm)</th>
                      <th className="pb-3 font-hanken">Hips (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { size: 'XS', bust: '81-84', waist: '61-64', hips: '89-91' },
                      { size: 'S', bust: '86-89', waist: '66-69', hips: '94-97' },
                      { size: 'M', bust: '91-94', waist: '71-74', hips: '99-102' },
                      { size: 'L', bust: '97-102', waist: '76-81', hips: '104-109' },
                      { size: 'XL', bust: '107-112', waist: '84-89', hips: '112-117' },
                    ].map((row) => (
                      <tr key={row.size} className="border-b border-primary/10">
                        <td className="py-3 pr-4 font-hanken text-sm font-semibold text-primary">{row.size}</td>
                        <td className="py-3 pr-4 font-hanken text-sm text-on-surface-variant">{row.bust}</td>
                        <td className="py-3 pr-4 font-hanken text-sm text-on-surface-variant">{row.waist}</td>
                        <td className="py-3 font-hanken text-sm text-on-surface-variant">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-primary/5 p-4 rounded-sm">
                <p className="font-hanken text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-primary">Custom sizing</strong> is available for all pieces. 
                  Select <strong>Custom</strong> above and we will reach out to take your exact measurements. 
                  For additional fit questions, <a href="https://wa.me/233541928675" target="_blank" rel="noopener noreferrer" className="text-secondary underline underline-offset-2 cursor-pointer">contact our team</a>.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default ProductDetail;
