import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/api';
import { playChime } from './notification';

export const createNotification = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
};

const typeIcons = {
  new_order: 'shopping_bag',
  order_status: 'local_shipping',
  bespoke_request: 'tailoring',
  inquiry: 'contact_support',
};

export const useNotifications = (recipientId, recipientType) => {
  const [notifications, setNotifications] = useState([]);
  const prevUnread = useRef(0);

  useEffect(() => {
    if (!recipientId) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', recipientId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(n => n.recipientType === recipientType)
        .sort((a, b) => {
          const ta = a.createdAt?.toDate?.()?.getTime() || 0;
          const tb = b.createdAt?.toDate?.()?.getTime() || 0;
          return tb - ta;
        })
        .slice(0, 50);
      setNotifications(list);
      const unread = list.filter(n => !n.read).length;
      if (unread > prevUnread.current && prevUnread.current !== 0) {
        playChime();
      }
      prevUnread.current = unread;
    });
    return unsub;
  }, [recipientId, recipientType]);

  const markRead = async (id) => {
    try { await updateDoc(doc(db, 'notifications', id), { read: true }); } catch {}
  };

  const markAllRead = async () => {
    notifications.forEach(n => { if (!n.read) markRead(n.id); });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead };
};

export const NotificationBell = ({ recipientId, recipientType, isAdmin = false, onNotificationClick }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(recipientId, recipientType);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (n) => {
    markRead(n.id);
    setOpen(false);
    if (onNotificationClick) onNotificationClick(n);
  };

  const base = isAdmin
    ? { bg: 'bg-[#222]', border: 'border-[#C5A880]/20', text: 'text-white/90', muted: 'text-white/40', accent: 'text-[#C5A880]', dot: 'bg-[#C5A880]', hover: 'hover:bg-[#333]', rowBg: 'bg-[#222]' }
    : { bg: 'bg-background', border: 'border-primary/10', text: 'text-primary', muted: 'text-on-surface-variant', accent: 'text-secondary', dot: 'bg-secondary', hover: 'hover:bg-surface/50', rowBg: '' };

  if (!recipientId) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(p => !p)} className={`relative ${isAdmin ? 'text-[#C5A880] hover:text-white' : 'text-primary hover:text-secondary'} transition-colors duration-300`} aria-label="Notifications">
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center ${isAdmin ? 'bg-red-500' : 'bg-red-500'} text-white`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-full mt-2 max-h-96 overflow-y-auto shadow-xl z-[300] ${base.bg} ${base.border} border ${
            isAdmin ? 'right-0 w-80' : 'right-0 w-60 md:w-80'
          }`}
        >
          <div className={`sticky top-0 ${base.bg} px-4 py-3 border-b ${base.border} flex justify-between items-center`}>
            <span className={`text-[10px] uppercase tracking-widest font-semibold ${base.text}`}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className={`text-[9px] uppercase tracking-widest ${base.accent} hover:underline`}>Mark all read</button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className={`px-4 py-8 text-center ${base.muted} text-xs`}>No notifications yet</div>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`block w-full text-left px-4 py-3 transition-colors ${base.hover} border-b ${base.border} ${base.rowBg} ${!n.read ? (isAdmin ? 'bg-[#C5A880]/10' : 'bg-secondary/5') : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-sm mt-0.5 ${!n.read ? base.accent : base.muted}`}>
                    {typeIcons[n.type] || 'circle_notifications'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${!n.read ? 'font-semibold' : ''} ${base.text} truncate`}>{n.message}</p>
                    <p className={`text-[9px] mt-0.5 ${base.muted}`}>{formatTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${base.dot}`} />}
                </div>
              </button>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};
