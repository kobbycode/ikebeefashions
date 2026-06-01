import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAlert = ({ config }) => {
  return (
    <AnimatePresence>
      {config && (
        <motion.div
          key="admin-alert-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            key="admin-alert-box"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#1A1A1A] border border-white/10 p-8 max-w-sm w-full shadow-2xl relative"
          >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 w-full h-[2px] ${config.type === 'danger' ? 'bg-red-500' : 'bg-[#C5A880]'}`} />

            <div className="mb-8">
              <h3 className="font-serif text-xl text-white mb-3 uppercase tracking-widest">
                {config.isConfirm ? 'Confirmation Required' : 'System Notice'}
              </h3>
              <p className="text-white/70 text-sm font-sans leading-relaxed">{config.message}</p>
            </div>

            <div className="flex gap-4 justify-end">
              {config.isConfirm && (
                <button
                  onClick={config.onCancel}
                  className="px-6 py-2.5 border border-white/20 text-white/70 hover:text-white hover:border-white transition-colors text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={config.onConfirm}
                className={`px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition-colors ${
                  config.type === 'danger'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-[#C5A880] text-white hover:bg-[#a38a68]'
                }`}
              >
                {config.isConfirm ? 'Proceed' : 'Acknowledge'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminAlert;
