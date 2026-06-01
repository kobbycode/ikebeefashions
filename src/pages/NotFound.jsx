import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
      {/* Background ghost text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
        <span className="font-bodoni text-[300px] leading-none text-primary">404</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10"
      >
        <span className="font-hanken text-label-sm text-secondary uppercase tracking-[0.4em] mb-6 block">
          Page Not Found
        </span>
        <h1 className="font-bodoni text-display-xl text-primary mb-6 italic leading-none">
          Lost in the Archive
        </h1>
        <div className="w-12 h-[1px] bg-secondary mx-auto mb-8"></div>
        <p className="font-hanken text-body-lg text-on-surface-variant max-w-md mb-12 leading-relaxed">
          This page doesn't exist or may have been moved. Let us guide you back to the collection.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-12 py-4 bg-primary text-on-primary font-hanken text-label-sm tracking-widest hover:bg-secondary transition-colors duration-500"
          >
            RETURN HOME
          </Link>
          <Link
            to="/collection"
            className="px-12 py-4 border border-primary text-primary font-hanken text-label-sm tracking-widest hover:bg-primary hover:text-on-primary transition-colors duration-500"
          >
            VIEW COLLECTION
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
