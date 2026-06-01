import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const navLinks = [
  { to: '/collection', label: 'Collection' },
  { to: '/lookbook', label: 'Lookbook' },
  { to: '/bespoke', label: 'Bespoke' },
  { to: '/heritage', label: 'Heritage' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isCartOpen, setIsCartOpen, cart, cartCount, removeFromCart, updateQuantity, cartTotal } = useCart();
  const location = useLocation();

  return (
    <>
      <nav className="w-full top-0 sticky z-50 bg-background/80 backdrop-blur-xl border-b border-primary/5 transition-all duration-500 ease-in-out">
        <div className="flex justify-between items-center px-margin-edge py-unit w-full max-w-container-max mx-auto">
          {/* Desktop Links - Left */}
          <div className="hidden md:flex gap-gutter">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`font-hanken text-label-sm transition-colors duration-300 relative group ${
                    isActive ? 'text-primary' : 'text-on-background/60 hover:text-primary'
                  }`}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-[1px] left-0 right-0 h-[1px] bg-secondary"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Logo - Center */}
          <Link to="/" className="block">
            <img src="/logo.jpeg" alt="IKEBEE" className="h-20 w-auto object-contain" />
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative group text-primary p-2 hover:text-secondary transition-colors duration-300"
              aria-label="Open Shopping Bag"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              className="text-primary hover:text-secondary transition-colors duration-300 md:hidden"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="fixed top-0 right-0 h-full w-72 bg-background z-50 flex flex-col px-10 py-16 md:hidden shadow-2xl"
            >
              {/* Drawer Close */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-6 right-6 text-primary hover:text-secondary transition-colors"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              {/* Drawer Logo */}
              <Link to="/" onClick={() => setMobileOpen(false)} className="mb-16 block">
                <img src="/logo.jpeg" alt="IKEBEE" className="h-28 w-auto object-contain" />
              </Link>

              {/* Drawer Links */}
              <nav className="flex flex-col gap-8">
                {navLinks.map(({ to, label }, i) => {
                  const isActive = location.pathname === to;
                  return (
                    <motion.div
                      key={to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <Link
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className={`font-bodoni text-headline-md block transition-colors duration-300 ${
                          isActive ? 'text-secondary' : 'text-primary hover:text-secondary'
                        }`}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="mt-auto pt-16 border-t border-primary/10">
                <p className="font-hanken text-label-sm text-on-surface-variant tracking-widest uppercase">
                  Crafted in Accra
                </p>
                <p className="font-hanken text-label-sm text-secondary tracking-widest">
                  &copy; {new Date().getFullYear()} IKEBEE
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Bag Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100]" 
              onClick={() => setIsCartOpen(false)} 
            />
            
            {/* Bag Panel */}
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background z-[110] p-8 md:p-12 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bodoni text-headline-sm text-primary italic">Shopping Bag</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-primary hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <span className="material-symbols-outlined text-[64px] text-primary mb-4">shopping_bag</span>
                    <p className="font-hanken text-label-sm uppercase tracking-widest text-primary mb-2">Your Bag is Empty</p>
                    <p className="font-hanken text-body-md text-on-surface-variant">Explore the collection to add bespoke pieces.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 border-b border-primary/10 pb-6">
                        <div className="w-24 h-32 bg-surface overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-hanken font-medium text-primary text-sm uppercase tracking-widest">{item.title || item.name}</h4>
                              <button onClick={() => removeFromCart(item.id)} className="text-on-surface-variant hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                            <p className="font-hanken text-xs text-on-surface-variant uppercase tracking-widest">{item.category}</p>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="flex items-center border border-primary/20">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-primary hover:bg-surface transition-colors">-</button>
                              <span className="font-hanken text-sm px-2 text-primary">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-primary hover:bg-surface transition-colors">+</button>
                            </div>
                            <p className="font-bodoni text-lg text-primary">GHS {item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-primary/20">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-hanken text-sm uppercase tracking-widest text-on-surface-variant">Subtotal</span>
                  <span className="font-bodoni text-2xl text-primary">GHS {cartTotal.toFixed(2)}</span>
                </div>
                {cart.length === 0 ? (
                  <Link to="/collection" onClick={() => setIsCartOpen(false)} className="block w-full py-5 bg-primary text-white text-center font-hanken text-label-sm uppercase tracking-widest hover:bg-secondary transition-colors">
                    DISCOVER COLLECTION
                  </Link>
                ) : (
                  <Link to="/checkout" onClick={() => setIsCartOpen(false)} className="block w-full py-5 bg-primary text-white text-center font-hanken text-label-sm uppercase tracking-widest hover:bg-secondary transition-colors flex justify-center items-center gap-2">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    PROCEED TO CHECKOUT
                  </Link>
                )}
                <p className="text-center font-hanken text-[10px] text-on-surface-variant uppercase tracking-widest mt-4">
                  Shipping & taxes calculated at checkout.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

