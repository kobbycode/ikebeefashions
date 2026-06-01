import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Splash = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800); // 2.8 seconds splash
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-primary flex items-center justify-center"
    >
      <div className="text-center overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4"
        >
          <img src="/logo.jpeg" alt="IKEBEE" className="h-32 md:h-48 w-auto object-contain" />
        </motion.div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1, ease: "easeInOut" }}
          className="w-24 h-[1px] bg-secondary mx-auto origin-left"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="font-hanken text-label-sm text-secondary tracking-[0.5em] mt-6 uppercase"
        >
          Modern Ancestry
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Splash;
