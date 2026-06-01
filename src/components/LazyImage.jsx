import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LazyImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton Pulse */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-surface-container animate-pulse z-0" />
      )}
      
      {/* Actual Image */}
      <motion.img
        initial={{ opacity: 0, scale: 1.05 }}
        animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className="w-full h-full object-cover relative z-10"
        {...props}
      />
    </div>
  );
};

export default LazyImage;
