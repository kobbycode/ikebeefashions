import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BackToTopBtn = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-[90] w-12 h-12 bg-primary text-white flex items-center justify-center rounded-full shadow-2xl hover:bg-secondary hover:text-primary transition-colors border border-transparent hover:border-primary"
          aria-label="Back to top"
        >
          <span className="material-symbols-outlined text-lg">arrow_upward</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTopBtn;
