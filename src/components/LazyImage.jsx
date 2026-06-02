import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="#1a1a1a" width="400" height="500"/><text x="200" y="250" text-anchor="middle" fill="#555" font-family="sans-serif" font-size="14" dy=".3em">Image unavailable</text></svg>'
);

const LazyImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton Pulse */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-surface-container animate-pulse z-0" />
      )}
      
      {/* Actual Image */}
      <motion.img
        initial={{ opacity: 0, scale: 1.05 }}
        animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        src={hasError ? PLACEHOLDER : (src || PLACEHOLDER)}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => { setHasError(true); setIsLoaded(true); }}
        className="w-full h-full object-cover relative z-10"
        {...props}
      />
    </div>
  );
};

export default LazyImage;
