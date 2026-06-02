/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const AlertContext = createContext(null);

const AlertModal = ({ config }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (!config) return null;

  const { message, type, title, isConfirm, onConfirm, onCancel } = config;

  // Icon mapping
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  // Styling based on theme (Admin Dark vs Website Light)
  const styles = isAdmin
    ? {
        overlay: 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md',
        card: 'bg-[#1A1A1A] border border-white/10 p-8 max-w-sm w-full shadow-2xl relative select-none font-sans',
        accentLine: `absolute top-0 left-0 w-full h-[3px] ${
          type === 'danger'
            ? 'bg-red-500'
            : type === 'success'
            ? 'bg-green-500'
            : type === 'warning'
            ? 'bg-yellow-500'
            : 'bg-[#C5A880]'
        }`,
        iconClass: `material-symbols-outlined text-[36px] ${
          type === 'danger'
            ? 'text-red-500'
            : type === 'success'
            ? 'text-green-500'
            : type === 'warning'
            ? 'text-yellow-500'
            : 'text-[#C5A880]'
        }`,
        title: 'font-serif text-lg text-white mb-2 uppercase tracking-widest flex items-center gap-3',
        message: 'text-white/70 text-sm font-sans leading-relaxed mb-8',
        btnCancel: 'px-6 py-2.5 border border-white/20 text-white/70 hover:text-white hover:border-white transition-colors text-xs uppercase tracking-widest',
        btnConfirm: `px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition-colors ${
          type === 'danger'
            ? 'bg-red-500 text-white hover:bg-red-600'
            : type === 'success'
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-[#C5A880] text-white hover:bg-[#a38a68]'
        }`,
      }
    : {
        overlay: 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md',
        card: 'bg-[#fbf9f4] border border-[#C5A059]/20 p-8 max-w-sm w-full shadow-[0_24px_64px_rgba(197,160,89,0.12)] relative select-none font-hanken',
        accentLine: `absolute top-0 left-0 w-full h-[3px] ${
          type === 'danger'
            ? 'bg-red-600'
            : type === 'success'
            ? 'bg-green-600'
            : type === 'warning'
            ? 'bg-amber-600'
            : 'bg-[#C5A059]'
        }`,
        iconClass: `material-symbols-outlined text-[36px] ${
          type === 'danger'
            ? 'text-red-600'
            : type === 'success'
            ? 'text-green-600'
            : type === 'warning'
            ? 'text-amber-600'
            : 'text-[#C5A059]'
        }`,
        title: 'font-bodoni text-xl text-primary mb-2 uppercase tracking-widest flex items-center gap-3 italic',
        message: 'text-on-surface-variant/80 text-sm font-light leading-relaxed mb-8',
        btnCancel: 'px-6 py-2.5 border border-primary/20 text-on-surface-variant hover:text-primary hover:border-primary transition-all duration-300 text-xs uppercase tracking-widest',
        btnConfirm: `px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
          type === 'danger'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : type === 'success'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-primary text-white hover:bg-[#C5A059]'
        }`,
      };

  return (
    <AnimatePresence>
      <motion.div
        key="alert-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.overlay}
      >
        <motion.div
          key="alert-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={styles.card}
        >
          {/* Accent Line */}
          <div className={styles.accentLine} />

          {/* Body Content */}
          <div className="mb-6 mt-2">
            <h3 className={styles.title}>
              <span className={styles.iconClass}>{getIcon()}</span>
              {title}
            </h3>
            <p className={styles.message}>{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            {isConfirm && (
              <button onClick={onCancel} className={styles.btnCancel}>
                Cancel
              </button>
            )}
            <button onClick={onConfirm} className={styles.btnConfirm}>
              {isConfirm ? 'Proceed' : 'Acknowledge'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const AlertProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  const showAlert = useCallback((message, type = 'info', title = null) => {
    return new Promise((resolve) => {
      setConfig({
        message,
        type,
        title: title || (type === 'success' ? 'Success' : type === 'danger' ? 'Error' : type === 'warning' ? 'Warning' : 'System Notice'),
        isConfirm: false,
        onConfirm: () => {
          setConfig(null);
          resolve(true);
        },
      });
    });
  }, []);

  const showConfirm = useCallback((message, type = 'warning', title = null) => {
    return new Promise((resolve) => {
      setConfig({
        message,
        type,
        title: title || 'Confirmation Required',
        isConfirm: true,
        onConfirm: () => {
          setConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setConfig(null);
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertModal config={config} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
