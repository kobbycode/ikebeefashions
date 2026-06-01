import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { playChime } from '../utils/notification';
import { useAlert } from '../context/AlertContext';

const statusFlow = ['pending', 'packing', 'delivering', 'delivered'];

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
};

const Timeline = ({ statusHistory = [], status }) => {
  const history = Array.isArray(statusHistory) ? statusHistory : [];
  return (
    <div className="flex items-center gap-0 mt-3">
      {statusFlow.map((stage, i) => {
        const stageIdx = history.findIndex(h => h.status === stage);
        const isReached = stageIdx !== -1;
        const isCurrent = history.length > 0 && history[history.length - 1].status === stage;
        return (
          <div key={stage} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                isReached ? 'bg-secondary text-white' : 'bg-primary/10 text-on-surface-variant/40'
              } ${isCurrent ? 'ring-2 ring-secondary ring-offset-1 ring-offset-background' : ''}`}>
                {isReached ? '✓' : i + 1}
              </div>
              <span className={`text-[7px] uppercase tracking-widest mt-1 whitespace-nowrap ${
                isReached ? 'text-secondary' : 'text-on-surface-variant/40'
              }`}>{stage}</span>
            </div>
            {i < statusFlow.length - 1 && (
              <div className={`flex-1 h-px mx-0.5 mt-[-1rem] ${isReached ? 'bg-secondary' : 'bg-primary/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Account = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showConfirm } = useAlert();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);
  const prevStatuses = useRef({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderParam = params.get('order');
    if (orderParam) setHighlightedOrderId(orderParam);
  }, [location.search]);

  useEffect(() => {
    if (!loadingOrders && highlightedOrderId) {
      setTimeout(() => {
        const el = document.getElementById(`order-${highlightedOrderId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [loadingOrders, highlightedOrderId]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(orderList);
      setLoadingOrders(false);

      orderList.forEach(order => {
        const prev = prevStatuses.current[order.id];
        if (prev && prev !== order.status) {
          playChime();
          setNotification({
            orderId: order.id.slice(0, 8).toUpperCase(),
            from: prev,
            to: order.status,
          });
        }
        prevStatuses.current[order.id] = order.status;
      });
    });
    return unsubscribe;
  }, [user]);

  const handleLogout = async () => {
    const confirmed = await showConfirm('Are you sure you want to sign out?', 'warning', 'Sign Out');
    if (!confirmed) return;
    await logout();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-margin-edge flex items-center justify-center">
        <p className="font-hanken text-sm text-on-surface-variant animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-margin-edge bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-6 z-50 bg-surface border border-secondary/30 p-4 shadow-lg max-w-sm"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-sm mt-0.5">campaign</span>
                <div>
                  <p className="font-hanken text-xs text-primary font-semibold uppercase tracking-widest">Order Updated</p>
                  <p className="font-hanken text-[10px] text-on-surface-variant mt-1">
                    Order <span className="text-secondary">{notification.orderId}</span> changed from <strong>{notification.from}</strong> to <strong>{notification.to}</strong>
                  </p>
                </div>
                <button onClick={() => setNotification(null)} className="text-on-surface-variant hover:text-primary ml-2">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-bodoni text-headline-lg text-primary">My Account</h1>
            <p className="font-hanken text-xs text-on-surface-variant mt-1">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="font-hanken text-[10px] uppercase tracking-widest text-on-surface-variant border border-primary/20 px-4 py-2 hover:text-primary transition-colors">
              Home
            </Link>
            <button onClick={handleLogout} className="font-hanken text-[10px] uppercase tracking-widest text-red-400 border border-red-500/30 px-4 py-2 hover:bg-red-500 hover:text-white transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Orders */}
        <h2 className="font-hanken text-label-sm text-primary uppercase tracking-widest mb-6 border-b border-primary/10 pb-3">Order History</h2>

        {loadingOrders ? (
          <div className="py-16 text-center">
            <p className="font-hanken text-sm text-on-surface-variant animate-pulse">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-primary/10">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-4">shopping_bag</span>
            <p className="font-hanken text-sm text-on-surface-variant mb-6">No orders yet.</p>
            <Link to="/collection" className="inline-block px-8 py-3 bg-primary text-white font-hanken text-[10px] uppercase tracking-widest hover:bg-secondary transition-colors">
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <motion.div
                key={order.id}
                id={`order-${order.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-surface/30 border p-6 transition-colors duration-500 ${
                  highlightedOrderId === order.id ? 'border-secondary border-2 bg-secondary/5' : 'border-primary/10'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-hanken text-xs text-secondary font-semibold uppercase tracking-widest">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="font-hanken text-[10px] text-on-surface-variant mt-1">
                      {formatDate(order.createdAt)} — {order.items?.length || 0} item(s)
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] text-white uppercase tracking-widest whitespace-nowrap ${
                    order.status === 'delivered' ? 'bg-green-700' :
                    order.status === 'delivering' ? 'bg-blue-700' :
                    order.status === 'packing' ? 'bg-purple-700' :
                    'bg-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <Timeline statusHistory={order.statusHistory} status={order.status} />
                <div className="mt-4 pt-3 border-t border-primary/10 flex justify-between items-center">
                  <p className="font-hanken text-xs text-on-surface-variant">
                    {order.customerInfo?.address && `${order.customerInfo.city}, ${order.customerInfo.country}`}
                  </p>
                  <p className="font-bodoni text-sm text-primary">GHS {order.total || order.totalAmount}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
