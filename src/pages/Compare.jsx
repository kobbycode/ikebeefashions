import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatGHS } from '../hooks/useProducts';

const COMPARE_KEY = 'ikebee_compare';

const getCompare = () => {
  try { return JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]'); } catch { return []; }
};

const Compare = () => {
  const [items, setItems] = useState([]);

  useEffect(() => { setItems(getCompare()); }, []);

  const removeItem = (id) => {
    const updated = items.filter(i => i.id !== id);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
    setItems(updated);
  };

  const clearAll = () => {
    localStorage.removeItem(COMPARE_KEY);
    setItems([]);
  };

  if (items.length === 0) return (
    <div className="min-h-screen pt-32 pb-20 bg-background px-margin-edge flex flex-col items-center justify-center">
      <span className="material-symbols-outlined text-[80px] text-white/20 mb-6">compare_arrows</span>
      <h1 className="font-bodoni text-display-sm text-primary mb-4">Compare Products</h1>
      <p className="font-hanken text-body-md text-on-surface-variant mb-8">Add products from the collection to compare side by side.</p>
      <Link to="/collection" className="px-8 py-4 bg-primary text-white text-xs uppercase tracking-widest">Browse Collection</Link>
    </div>
  );

  const keys = [
    { label: 'Price', render: (item) => formatGHS(item.price) },
    { label: 'Description', render: (item) => item.description?.slice(0, 100) || '-' },
    { label: 'Category', render: (item) => item.category || '-' },
    { label: 'Stock', render: (item) => item.totalStock > 0 ? `${item.totalStock} available` : 'Sold Out' },
    { label: 'Sizes', render: (item) => Array.isArray(item.sizes) ? item.sizes.map(s => typeof s === 'string' ? s : s.name).join(', ') : '-' },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background px-margin-edge">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-bodoni text-display-sm text-primary">Compare Products</h1>
            <p className="font-hanken text-xs text-on-surface-variant mt-1">{items.length} product{items.length > 1 ? 's' : ''}</p>
          </div>
          <button onClick={clearAll} className="text-xs text-red-400 uppercase tracking-widest hover:text-red-300">Clear All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-40 p-4 border border-white/10 text-left text-[10px] text-white/40 uppercase tracking-widest">Product</th>
                {items.map(item => (
                  <th key={item.id} className="p-4 border border-white/10 text-center min-w-[180px]">
                    <img src={item.image} alt={item.title || item.name} className="w-full h-40 object-cover mb-3" onError={e => { e.target.style.display = 'none'; }} />
                    <p className="font-hanken text-xs text-white font-semibold">{item.title || item.name}</p>
                    <button onClick={() => removeItem(item.id)} className="mt-2 text-[10px] text-red-400 uppercase tracking-widest hover:text-red-300">Remove</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map(({ label, render }) => (
                <tr key={label}>
                  <td className="p-4 border border-white/10 text-[10px] text-white/40 uppercase tracking-widest">{label}</td>
                  {items.map(item => (
                    <td key={item.id} className="p-4 border border-white/10 text-center text-xs text-white/70">{render(item)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export const addToCompare = (product) => {
  const current = getCompare();
  if (current.find(i => i.id === product.id)) return;
  const updated = [...current, { id: product.id, title: product.title || product.name, name: product.name, image: product.image, price: product.price, description: product.description, category: product.category, totalStock: product.totalStock ?? product.stock, sizes: product.sizes }];
  localStorage.setItem(COMPARE_KEY, JSON.stringify(updated.slice(0, 4)));
};

export default Compare;
