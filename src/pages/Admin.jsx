import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, onSnapshot, orderBy, query, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, storage, loginAdmin, logoutAdmin } from '../services/api';
import { products as localProducts } from '../data/products';
import { useAlert } from '../context/AlertContext';
import { createNotification, NotificationBell } from '../utils/notifications';
import emailjs from '@emailjs/browser';

const IMG_FALLBACK = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="#1a1a1a" width="400" height="500"/><text x="200" y="250" text-anchor="middle" fill="#555" font-family="sans-serif" font-size="14" dy=".3em">Unavailable</text></svg>'
);

const Admin = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('orders');
  const [data, setData] = useState({ orders: [], bespoke: [], inquiries: [], newsletter: [], products: [], lookbook: [] });
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', tag: '', isNew: false, details: '', stock: '' });
  const [newProductImage, setNewProductImage] = useState(null);
  const [newProductGallery, setNewProductGallery] = useState([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponMinAmount, setCouponMinAmount] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [showCouponForm, setShowCouponForm] = useState(false);

  // Lookbook Form State
  const [showLookbookForm, setShowLookbookForm] = useState(false);
  const [newLookbookImage, setNewLookbookImage] = useState(null);
  const [newLookbookCaption, setNewLookbookCaption] = useState('');
  const [newLookbookSlug, setNewLookbookSlug] = useState('');

  // Request Details Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Mass Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Highlighted order from notification click
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

  const handleNotificationClick = (n) => {
    if (n.type === 'new_order' || n.type === 'order_status') {
      setActiveTab('orders');
      setHighlightedOrderId(n.orderId);
      setTimeout(() => {
        const row = document.getElementById(`order-row-${n.orderId}`);
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  // Persistent Order Notifications
  const [pendingNotifications, setPendingNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_notifications') || '[]'); } catch { return []; }
  });
  const dismissedIds = useRef(new Set());
  const knownOrderIds = useRef(new Set());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('admin_dismissed_notifications') || '[]');
      dismissedIds.current = new Set(saved);
    } catch {}
  }, []);

  const { showAlert: customAlert, showConfirm: customConfirm } = useAlert();

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time order listener for admin
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setData(prev => ({ ...prev, orders: ordersList }));
      setLoading(false);

      ordersList.forEach(order => {
        if (!knownOrderIds.current.has(order.id)) {
          knownOrderIds.current.add(order.id);
          if (!dismissedIds.current.has(order.id)) {
            const entry = {
              id: order.id,
              orderId: order.id.slice(0, 8).toUpperCase(),
              customer: order.customerInfo?.firstName
                ? `${order.customerInfo.firstName} ${order.customerInfo.lastName || ''}`
                : 'New Customer',
              total: order.totalAmount || order.total,
            };
            setPendingNotifications(prev => {
              const exists = prev.some(p => p.id === order.id);
              if (exists) return prev;
              const updated = [...prev, entry];
              localStorage.setItem('admin_notifications', JSON.stringify(updated));
              return updated;
            });
          }
        }
      });
    });
    return unsubscribe;
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await loginAdmin(loginForm.email, loginForm.password);
    } catch (err) {
      setLoginError('Invalid credentials. Access denied.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const bespokeQ = query(collection(db, 'bespoke_requests'), orderBy('createdAt', 'desc'));
      const bespokeSnap = await getDocs(bespokeQ);
      const bespokeList = bespokeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const inqQ = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const inqSnap = await getDocs(inqQ);
      const inqList = inqSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const newsQ = query(collection(db, 'newsletter_subscribers'), orderBy('subscribedAt', 'desc'));
      const newsSnap = await getDocs(newsQ);
      const newsList = newsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const prodQ = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const prodSnap = await getDocs(prodQ);
      const prodList = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const lookQ = query(collection(db, 'lookbook'), orderBy('createdAt', 'desc'));
      const lookSnap = await getDocs(lookQ);
      const lookList = lookSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const couponSnap = await getDocs(collection(db, 'coupons'));
      setCoupons(couponSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      setData(prev => ({ ...prev, bespoke: bespokeList, inquiries: inqList, newsletter: newsList, products: prodList, lookbook: lookList }));
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, prefix) => {
    const fileRef = ref(storage, `${prefix}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct && !newProductImage) return customAlert("Please select an image before publishing.", "warning");
    setIsUploading(true);

    try {
      let imageUrl = editingProduct ? editingProduct.image : null;

      if (newProductImage) {
        imageUrl = await uploadFile(newProductImage, 'products');
      }

      const galleryUrls = [...existingGalleryUrls];
      for (const file of newProductGallery) {
        const url = await uploadFile(file, 'products/gallery');
        galleryUrls.push(url);
      }

      const productData = {
        name: newProduct.name,
        title: newProduct.name,
        image: imageUrl,
        galleryImgs: galleryUrls.length ? galleryUrls : [imageUrl],
        detailImg: galleryUrls.length > 1 ? galleryUrls[1] : imageUrl,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        tag: newProduct.tag || '',
        isNew: Boolean(newProduct.isNew),
        details: newProduct.details,
        stock: newProduct.stock ? parseInt(newProduct.stock, 10) : 0,
        slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...productData,
          updatedAt: serverTimestamp()
        });
        await customAlert("Product updated successfully.", "success");
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp()
        });
        await customAlert("Product published successfully.", "success");
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setNewProduct({ name: '', price: '', category: '', tag: '', isNew: false, details: '' });
      setNewProductImage(null);
      setNewProductGallery([]);
      setExistingGalleryUrls([]);
      fetchData();
    } catch (error) {
      console.error("Upload error:", error);
      await customAlert(`Failed to ${editingProduct ? 'update' : 'upload'} product.`, "danger");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    const rawPrice = prod.price;
    const numericPrice = rawPrice != null
      ? String(rawPrice).replace(/[^0-9.-]+/g, '')
      : '';
    const rawDetails = prod.details || prod.description || '';
    const detailsStr = Array.isArray(rawDetails) ? rawDetails.join('\n') : String(rawDetails);
    setNewProduct({
      name: prod.title || prod.name || '',
      price: numericPrice,
      category: prod.category || '',
      tag: prod.tag || '',
      isNew: prod.isNew || false,
      details: detailsStr,
      stock: prod.stock != null ? String(prod.stock) : ''
    });
    setNewProductImage(null);
    setNewProductGallery([]);
    setExistingGalleryUrls(prod.galleryImgs?.filter(u => u) || []);
    setShowProductForm(true);
  };

  const handleMigrateCatalog = async () => {
    const isConfirmed = await customConfirm("This will migrate all local products to the live database. Are you sure you want to proceed?", "warning");
    if(!isConfirmed) return;
    
    setIsUploading(true);
    try {
      let count = 0;
      for (const prod of localProducts) {
        const q = query(collection(db, 'products'), where('slug', '==', prod.slug));
        const snap = await getDocs(q);
        if (snap.empty) {
          // Remove the hardcoded 'id' so Firestore creates its own ID
          const { id, ...prodWithoutId } = prod;
          await addDoc(collection(db, 'products'), {
            ...prodWithoutId,
            name: prod.title, // Add fallback mappings just in case
            image: prod.img,
            createdAt: serverTimestamp()
          });
          count++;
        }
      }
      await customAlert(`Successfully migrated ${count} products to the live database!`, "success");
      fetchData();
    } catch (error) {
      console.error("Migration error:", error);
      await customAlert(`Migration failed: ${error.message}`, "danger");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    const isConfirmed = await customConfirm("Are you sure you want to permanently delete this product?", "danger");
    if(isConfirmed) {
      await deleteDoc(doc(db, 'products', id));
      fetchData();
    }
  };

  const handleAddLookbookImage = async (e) => {
    e.preventDefault();
    if (!newLookbookImage) return customAlert("Please select an image.", "warning");
    setIsUploading(true);
    try {
      const imageRef = ref(storage, `lookbook/${Date.now()}_${newLookbookImage.name}`);
      await uploadBytes(imageRef, newLookbookImage);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'lookbook'), {
        image: imageUrl,
        caption: newLookbookCaption,
        slug: newLookbookSlug || null,
        createdAt: serverTimestamp()
      });

      await customAlert("Lookbook asset published successfully.", "success");
      setNewLookbookImage(null);
      setNewLookbookCaption('');
      setNewLookbookSlug('');
      setShowLookbookForm(false);
      fetchData();
    } catch (error) {
      console.error("Upload error:", error);
      await customAlert("Failed to upload lookbook asset.", "danger");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteLookbookImage = async (id) => {
    const isConfirmed = await customConfirm("Are you sure you want to permanently delete this image?", "danger");
    if(isConfirmed) {
      await deleteDoc(doc(db, 'lookbook', id));
      fetchData();
    }
  };

  const toggleOrderSelection = (id) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOrders = () => {
    if (selectedOrderIds.length === data.orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(data.orders.map(o => o.id));
    }
  };

  const handleDeleteSelectedOrders = async () => {
    if (selectedOrderIds.length === 0) return;
    const isConfirmed = await customConfirm(
      `Are you sure you want to permanently delete ${selectedOrderIds.length} order(s)?`,
      "danger"
    );
    if (!isConfirmed) return;
    try {
      await Promise.all(selectedOrderIds.map(id => deleteDoc(doc(db, 'orders', id))));
      await customAlert(`Successfully deleted ${selectedOrderIds.length} order(s).`, "success");
      setSelectedOrderIds([]);
      fetchData();
    } catch (error) {
      console.error("Error deleting orders:", error);
      await customAlert("Failed to delete some orders.", "danger");
    }
  };

  const statusFlow = ['pending', 'packing', 'delivering', 'delivered'];

  const getStatusColor = (status) => {
    const map = { pending: 'bg-yellow-900/40 text-yellow-400', packing: 'bg-blue-900/40 text-blue-400', delivering: 'bg-purple-900/40 text-purple-400', delivered: 'bg-green-900/40 text-green-400', cancelled: 'bg-red-900/40 text-red-400' };
    return map[status] || 'bg-white/10 text-white/50';
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderItem = data.orders.find(o => o.id === orderId);
      const historyEntry = { status: newStatus, timestamp: new Date().toISOString() };
      const existingHistory = Array.isArray(orderItem?.statusHistory) ? orderItem.statusHistory : [];
      existingHistory.push(historyEntry);
      await updateDoc(orderRef, {
        status: newStatus,
        statusHistory: existingHistory,
        updatedAt: serverTimestamp()
      });
      const shortRef = orderId.slice(0, 8).toUpperCase();
      if (orderItem?.userId) {
        createNotification({
          type: 'order_status',
          message: `Order #${shortRef} is now "${newStatus}"`,
          recipientId: orderItem.userId,
          recipientType: 'customer',
          orderId: orderId,
        });
      }
      createNotification({
        type: 'order_status',
        message: `Order #${shortRef} changed to "${newStatus}" by admin`,
        recipientId: 'admin',
        recipientType: 'admin',
        orderId: orderId,
      });

      if (orderItem?.customerInfo?.email) {
        try {
          await emailjs.send('service_csylkvj', 'template_hgjfxad', {
            to_name: orderItem.customerInfo.firstName || 'Customer',
            to_email: orderItem.customerInfo.email,
            email: orderItem.customerInfo.email,
            reply_to: orderItem.customerInfo.email,
            order_id: shortRef,
            order_details: `Your order status has been updated to "${newStatus}".`,
            total_cost: '',
            shipping_cost: '',
            tax_cost: '',
            user_email: orderItem.customerInfo.email,
            recipient: orderItem.customerInfo.email,
            recipient_email: orderItem.customerInfo.email,
            logo: window.location.origin + '/logo.jpeg',
          }, 'VBWEkwRY-kFE8tLyS');
        } catch (emailErr) {
          console.error('Failed to send status email:', emailErr);
        }
      }

      await customAlert(`Order status updated to "${newStatus}".`, "success");
    } catch (error) {
      console.error("Error updating order status:", error);
      await customAlert("Failed to update order status.", "danger");
    }
  };

  const handleCancelOrder = async (orderId) => {
    const ok = await customConfirm('Are you sure you want to cancel this order? This cannot be undone.', 'danger');
    if (!ok) return;
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderItem = data.orders.find(o => o.id === orderId);
      await updateDoc(orderRef, { status: 'cancelled', updatedAt: serverTimestamp() });
      if (orderItem?.userId) {
        createNotification({
          type: 'order_status',
          message: `Order #${orderId.slice(0, 8).toUpperCase()} has been cancelled`,
          recipientId: orderItem.userId, recipientType: 'customer', orderId,
        });
      }
      await customAlert('Order cancelled.', 'success');
    } catch (err) {
      await customAlert('Failed to cancel order.', 'danger');
    }
  };

  const dismissNotification = (id) => {
    setPendingNotifications(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      return updated;
    });
    dismissedIds.current.add(id);
    localStorage.setItem('admin_dismissed_notifications', JSON.stringify([...dismissedIds.current]));
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount) return customAlert('Code and discount are required.', 'warning');
    try {
      await addDoc(collection(db, 'coupons'), {
        code: couponCode.toUpperCase(),
        discount: parseFloat(couponDiscount),
        minAmount: couponMinAmount ? parseFloat(couponMinAmount) : 0,
        createdAt: serverTimestamp(),
      });
      await customAlert(`Coupon "${couponCode.toUpperCase()}" created.`, 'success');
      setCouponCode(''); setCouponDiscount(''); setCouponMinAmount(''); setShowCouponForm(false);
      fetchData();
    } catch (err) {
      await customAlert('Failed to create coupon.', 'danger');
    }
  };

  const handleDeleteCoupon = async (id) => {
    const ok = await customConfirm('Delete this coupon?', 'warning');
    if (!ok) return;
    await deleteDoc(doc(db, 'coupons', id));
    fetchData();
  };

  const getNextStatus = (currentStatus) => {
    const idx = statusFlow.indexOf(currentStatus);
    if (idx === -1 || idx >= statusFlow.length - 1) return null;
    return statusFlow[idx + 1];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };

  if (authLoading) return <div className="min-h-screen bg-[#111111] flex items-center justify-center text-[#C5A880] uppercase tracking-widest text-sm animate-pulse">Initializing Secure Connection...</div>;

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center font-sans p-6 relative overflow-hidden">
        {/* Luxury Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C5A880]/30 via-[#111111] to-[#111111]"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md bg-[#1A1A1A] p-10 border border-white/10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src="/logo.jpeg" alt="IKEBEE" className="h-24 w-auto object-contain" />
            </div>
            <p className="text-[#C5A880] text-xs uppercase tracking-widest">Authorized Personnel Only</p>
          </div>
          
          {loginError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center p-3 mb-6 uppercase tracking-widest">{loginError}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Admin Email</label>
              <input 
                type="email" required
                value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-[#C5A880] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Passcode</label>
              <input 
                type="password" required
                value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-[#C5A880] transition-colors"
              />
            </div>
            <button type="submit" className="w-full bg-white text-black py-4 text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#C5A880] hover:text-white transition-all duration-300 mt-4">
              Enter Command Center
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-[#111111] text-white pt-16 px-6 md:px-12 font-sans relative">
      {/* Persistent Order Notification Toasts */}
      <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
        {pendingNotifications.map((n, idx) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#222] border border-[#C5A880]/30 p-4 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#C5A880] text-sm mt-0.5">notifications_active</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#C5A880] uppercase tracking-widest font-semibold">New Order Received</p>
                <p className="text-xs text-white/80 mt-1">#{n.orderId}</p>
                <p className="text-[10px] text-white/50 truncate">{n.customer} — GHS {n.total}</p>
              </div>
              <button onClick={() => dismissNotification(n.id)} className="text-white/30 hover:text-white ml-2 shrink-0">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/20 pb-6 mb-8">
          <div>
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <img src="/logo.jpeg" alt="IKEBEE" className="h-20 w-auto object-contain" />
            <h1 className="text-xl md:text-3xl font-serif tracking-wide uppercase">Command Center</h1>
          </div>
            <p className="text-[#C5A880] tracking-widest text-xs uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Secure Database Online • {user.email}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <NotificationBell recipientId="admin" recipientType="admin" isAdmin onNotificationClick={handleNotificationClick} />
            <button onClick={fetchData} className="px-6 py-3 border border-white/30 hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-xs">
              {loading ? 'Syncing...' : 'Refresh'}
            </button>
            <button onClick={logoutAdmin} className="px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors uppercase tracking-widest text-xs">
              Lock & Exit
            </button>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Orders', count: data.orders.length, icon: 'receipt_long' },
            { label: 'Revenue (GHS)', count: data.orders.reduce((sum, o) => {
              const raw = o.totalAmount || o.total || 0;
              return sum + (typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.-]+/g, '')) : Number(raw));
            }, 0).toLocaleString(), icon: 'payments' },
            { label: 'Pending', count: data.orders.filter(o => o.status === 'pending').length, icon: 'schedule' },
            { label: 'Delivered', count: data.orders.filter(o => o.status === 'delivered').length, icon: 'check_circle' },
            { label: 'Total Inventory', count: data.products.length, icon: 'inventory_2' },
            { label: 'Bespoke Requests', count: data.bespoke.length, icon: 'design_services' },
            { label: 'Private Inquiries', count: data.inquiries.length, icon: 'mail' },
            { label: 'Lookbook Assets', count: data.lookbook.length, icon: 'photo_library' },
            { label: 'Subscribers', count: data.newsletter.length, icon: 'group' },
          ].map((stat, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-[#1A1A1A] border border-white/10 p-6 flex flex-col justify-between hover:border-[#C5A880]/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-[#C5A880]">{stat.icon}</span>
                <span className="text-3xl font-serif text-white">{loading ? '-' : stat.count}</span>
              </div>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-white/10 mb-8 overflow-x-auto">
          {['orders', 'bespoke', 'inquiries', 'products', 'lookbook', 'newsletter', 'coupons'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 uppercase tracking-widest text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab ? 'text-[#C5A880] border-b-2 border-[#C5A880]' : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')} ({data[tab].length})
            </button>
          ))}
        </div>

        {/* Products Management Area */}
        {activeTab === 'products' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl uppercase tracking-widest">Inventory Management</h2>
              <div className="flex gap-4">
                <button 
                  onClick={handleMigrateCatalog}
                  disabled={isUploading}
                  className="bg-transparent border border-[#C5A880] text-[#C5A880] px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C5A880] hover:text-white transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Syncing...' : 'Migrate Local Catalog'}
                </button>
                <button 
                  onClick={() => {
                    setShowProductForm(!showProductForm);
                    setEditingProduct(null);
                    setNewProduct({ name: '', price: '', category: '', tag: '', isNew: false, details: '', stock: '' });
                    setNewProductImage(null);
                    setNewProductGallery([]);
                    setExistingGalleryUrls([]);
                  }}
                  className="bg-[#C5A880] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#a38a68] transition-colors"
                >
                  {showProductForm ? 'Cancel' : '+ Add New Product'}
                </button>
              </div>
            </div>

            {/* Add/Edit Product Form */}
            <AnimatePresence>
              {showProductForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddOrUpdateProduct} 
                  className="bg-[#1A1A1A] p-6 border border-white/10 mb-8 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Product Name</label>
                      <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880]"/>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Price (GHS)</label>
                      <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880]"/>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Category (e.g. FW24)</label>
                      <input type="text" required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880]"/>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Tag (e.g. LIMITED EDITION)</label>
                      <input type="text" value={newProduct.tag} onChange={e => setNewProduct({...newProduct, tag: e.target.value})} className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880]"/>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Main Product Image</label>
                      <input type="file" accept="image/*" onChange={e => setNewProductImage(e.target.files[0])} className="text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:uppercase file:tracking-widest file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"/>
                      {(editingProduct?.image || newProductImage) && (
                        <div className="mt-2 flex gap-2">
                          {editingProduct?.image && !newProductImage && (
                            <div className="relative w-16 h-16">
                              <img src={editingProduct.image} alt="Current main" className="w-full h-full object-cover" />
                            </div>
                          )}
                          {newProductImage && (
                            <div className="relative w-16 h-16">
                              <img src={URL.createObjectURL(newProductImage)} alt="New main" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Gallery Images (additional views)</label>
                      <input type="file" accept="image/*" multiple onChange={e => setNewProductGallery(Array.from(e.target.files))} className="text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:uppercase file:tracking-widest file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"/>
                      {(existingGalleryUrls.length > 0 || newProductGallery.length > 0) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {existingGalleryUrls.map((url, i) => (
                            <div key={`exist-${i}`} className="relative w-16 h-16 group/img">
                              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setExistingGalleryUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">&times;</button>
                            </div>
                          ))}
                          {newProductGallery.map((file, i) => (
                            <div key={`new-${i}`} className="relative w-16 h-16">
                              <img src={URL.createObjectURL(file)} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={newProduct.isNew} onChange={e => setNewProduct({...newProduct, isNew: e.target.checked})} className="accent-[#C5A880] w-4 h-4" />
                        <span className="text-xs text-white/70 uppercase tracking-widest">Mark as "NEW"</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Stock Quantity</label>
                      <input type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880]" />
                    </div>
                  </div>
                  <div className="mt-6">
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Product Description / Details</label>
                      <textarea required rows="3" value={newProduct.details} onChange={e => setNewProduct({...newProduct, details: e.target.value})} className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880] resize-none"></textarea>
                  </div>
                  <button type="submit" disabled={isUploading} className="mt-6 bg-white text-black px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A880] hover:text-white transition-colors disabled:opacity-50">
                    {isUploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Publish Product'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.products.map(prod => (
                <div key={prod.id} className="bg-[#1A1A1A] border border-white/10 group relative overflow-hidden">
                  <div className="h-48 overflow-hidden bg-black/50">
                    <img src={prod.image} alt={prod.name} onError={e => { if (e.target.src !== IMG_FALLBACK) e.target.src = IMG_FALLBACK; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] text-[#C5A880] tracking-widest uppercase mb-1">{prod.category}</p>
                    <h3 className="text-sm font-semibold truncate">{prod.title || prod.name}</h3>
                    <p className="text-white/60 text-sm mt-1">GHS {typeof prod.price === 'string' && prod.price.startsWith('GHS') ? prod.price.replace('GHS ', '') : Number(prod.price).toLocaleString()}</p>
                    <p className={`text-[9px] uppercase tracking-widest mt-2 ${(prod.stock || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(prod.stock || 0) > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(prod)} className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-[#C5A880] hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
              {data.products.length === 0 && !loading && (
                <div className="col-span-full py-12 text-center text-white/40 uppercase tracking-widest text-sm border border-dashed border-white/10">
                  No products in inventory.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lookbook Management Area */}
        {activeTab === 'lookbook' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl uppercase tracking-widest">Lookbook Gallery</h2>
              <button 
                onClick={() => {
                  setShowLookbookForm(!showLookbookForm);
                  setNewLookbookImage(null);
                  setNewLookbookCaption('');
                }}
                className="bg-[#C5A880] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#a38a68] transition-colors"
              >
                {showLookbookForm ? 'Cancel' : '+ Add Asset'}
              </button>
            </div>

            {/* Add Lookbook Asset Form */}
            <AnimatePresence>
              {showLookbookForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddLookbookImage} 
                  className="bg-[#1A1A1A] p-6 border border-white/10 mb-8 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Image Asset</label>
                      <input type="file" accept="image/*" required onChange={e => setNewLookbookImage(e.target.files[0])} className="text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:uppercase file:tracking-widest file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"/>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Caption (Optional)</label>
                      <input type="text" value={newLookbookCaption} onChange={e => setNewLookbookCaption(e.target.value)} placeholder="e.g. FW24 Editorial in London" className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880]"/>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Link to Product (Optional)</label>
                      <select
                        value={newLookbookSlug}
                        onChange={e => setNewLookbookSlug(e.target.value)}
                        className="w-full bg-[#111111] border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880] appearance-none cursor-pointer"
                      >
                        <option value="">— No link —</option>
                        {data.products.map(prod => (
                          <option key={prod.id} value={prod.slug || prod.id}>
                            {prod.title || prod.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={isUploading} className="mt-6 bg-white text-black px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A880] hover:text-white transition-colors disabled:opacity-50">
                    {isUploading ? 'Uploading...' : 'Publish Asset'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Lookbook Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {data.lookbook.map(asset => (
                <div key={asset.id} className="bg-[#1A1A1A] border border-white/10 group relative overflow-hidden h-64">
                  <img src={asset.image} alt={asset.caption} onError={e => { if (e.target.src !== IMG_FALLBACK) e.target.src = IMG_FALLBACK; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-xs text-white/90 uppercase tracking-widest truncate">{asset.caption || 'No Caption'}</p>
                    <p className="text-[10px] text-[#C5A880] mt-1">{formatDate(asset.createdAt)}</p>
                    {asset.slug && (
                      <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>link</span>
                        Linked to product
                      </p>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDeleteLookbookImage(asset.id)} className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
              {data.lookbook.length === 0 && !loading && (
                <div className="col-span-full py-12 text-center text-white/40 uppercase tracking-widest text-sm border border-dashed border-white/10">
                  No editorial assets uploaded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coupons Management */}
        {activeTab === 'coupons' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl uppercase tracking-widest">Coupon Codes</h2>
              <button onClick={() => setShowCouponForm(!showCouponForm)} className="bg-[#C5A880] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#a38a68] transition-colors">
                {showCouponForm ? 'Cancel' : '+ New Coupon'}
              </button>
            </div>

            {showCouponForm && (
              <form onSubmit={handleAddCoupon} className="bg-[#1A1A1A] p-6 border border-white/10 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Code</label>
                    <input type="text" required value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880]" placeholder="e.g. SUMMER20" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Discount (%)</label>
                    <input type="number" required min="1" max="100" value={couponDiscount} onChange={e => setCouponDiscount(e.target.value)} className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880]" placeholder="e.g. 20" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-widest mb-2">Min. Amount (GHS) — optional</label>
                    <input type="number" min="0" value={couponMinAmount} onChange={e => setCouponMinAmount(e.target.value)} className="w-full bg-transparent border-b border-white/20 pb-2 text-white text-sm focus:outline-none focus:border-[#C5A880]" />
                  </div>
                </div>
                <button type="submit" className="mt-6 bg-white text-black px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#C5A880] hover:text-white transition-colors">Create Coupon</button>
              </form>
            )}

            <div className="bg-[#1A1A1A] border border-white/10 p-6">
              {coupons.length === 0 ? (
                <p className="text-white/40 text-center py-8 uppercase tracking-widest text-xs">No coupons yet.</p>
              ) : (
                <div className="space-y-3">
                  {coupons.map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-black/30 p-4 border border-white/5">
                      <div>
                        <span className="text-[#C5A880] font-mono text-sm font-bold">{c.code}</span>
                        <span className="text-white/60 text-xs ml-4">{c.discount}% off{c.minAmount > 0 ? ` (min. GHS ${c.minAmount.toLocaleString()})` : ''}</span>
                      </div>
                      <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-400 hover:text-red-300 text-xs uppercase tracking-widest cursor-pointer bg-transparent border-none p-0">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Area for Requests */}
        {activeTab !== 'products' && activeTab !== 'lookbook' && activeTab !== 'coupons' && (
          <div className="bg-[#1A1A1A] border border-white/10 p-6 md:p-8 min-h-[500px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-white/50 animate-pulse tracking-widest uppercase text-sm">
                Loading Secure Data...
              </div>
            ) : data[activeTab].length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/40 tracking-widest uppercase py-20 text-sm">
                No records found.
              </div>
            ) : (
              <>
                {activeTab === 'orders' && selectedOrderIds.length > 0 && (
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <span className="text-xs text-white/60 uppercase tracking-widest">
                      {selectedOrderIds.length} order(s) selected
                    </span>
                    <button
                      onClick={handleDeleteSelectedOrders}
                      className="px-4 py-2 border border-red-500/50 text-red-400 text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Delete Selected
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/20 text-white/60 text-[10px] uppercase tracking-widest">
                      {activeTab === 'orders' && (
                        <th className="pb-4 font-normal w-8">
                          <input
                            type="checkbox"
                            checked={data.orders.length > 0 && selectedOrderIds.length === data.orders.length}
                            onChange={toggleSelectAllOrders}
                            className="accent-[#C5A880] w-4 h-4 cursor-pointer"
                          />
                        </th>
                      )}
                      <th className="pb-4 font-normal">Date</th>
                      {activeTab === 'orders' && (
                        <>
                          <th className="pb-4 font-normal">Order ID</th>
                          <th className="pb-4 font-normal">Customer</th>
                          <th className="pb-4 font-normal">Total</th>
                          <th className="pb-4 font-normal">Status</th>
                          <th className="pb-4 font-normal text-right">Actions</th>
                        </>
                      )}
                      {activeTab === 'bespoke' && (
                        <>
                          <th className="pb-4 font-normal">Client Name</th>
                          <th className="pb-4 font-normal">Email</th>
                          <th className="pb-4 font-normal">Phone</th>
                          <th className="pb-4 font-normal">Type</th>
                          <th className="pb-4 font-normal text-right">Actions</th>
                        </>
                      )}
                      {activeTab === 'inquiries' && (
                        <>
                          <th className="pb-4 font-normal">Item</th>
                          <th className="pb-4 font-normal">Name</th>
                          <th className="pb-4 font-normal">Email</th>
                          <th className="pb-4 font-normal text-right">Actions</th>
                        </>
                      )}
                      {activeTab === 'newsletter' && (
                        <th className="pb-4 font-normal">Subscriber Email</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data[activeTab].map((item, index) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                        key={item.id} 
                        id={`order-row-${item.id}`}
                        className={`border-b border-white/5 transition-colors group ${selectedOrderIds.includes(item.id) ? 'bg-[#C5A880]/10' : highlightedOrderId === item.id ? 'bg-[#C5A880]/20' : 'hover:bg-white/5'}`}
                      >
                        {activeTab === 'orders' && (
                          <td className="py-5 w-8">
                            <input
                              type="checkbox"
                              checked={selectedOrderIds.includes(item.id)}
                              onChange={() => toggleOrderSelection(item.id)}
                              className="accent-[#C5A880] w-4 h-4 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-5 text-xs text-white/80">{formatDate(item.createdAt || item.subscribedAt)}</td>
                        
                        {activeTab === 'orders' && (
                          <>
                            <td className="py-5 text-sm font-semibold text-[#C5A880]">{item.id.slice(0, 8)}</td>
                            <td className="py-5 text-sm text-white/70">
                              {item.customerInfo?.firstName} {item.customerInfo?.lastName}<br/>
                              <span className="text-[10px] text-white/40">{item.customerInfo?.email}</span>
                            </td>
                            <td className="py-5 text-sm text-white">GHS {item.total}</td>
                            <td className="py-5 text-sm">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-[10px] uppercase tracking-widest whitespace-nowrap ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                                {getNextStatus(item.status) && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(item.id, getNextStatus(item.status))}
                                    className="text-[#C5A880] hover:text-white text-[10px] uppercase tracking-widest border border-[#C5A880]/30 hover:border-white px-2 py-1 transition-colors whitespace-nowrap"
                                  >
                                    → {getNextStatus(item.status)}
                                  </button>
                                )}
                                {item.status !== 'delivered' && item.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleCancelOrder(item.id)}
                                    className="text-red-400 hover:text-white text-[10px] uppercase tracking-widest border border-red-400/30 hover:border-red-400 px-2 py-1 transition-colors whitespace-nowrap"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-5 text-right">
                              <button onClick={() => setSelectedRequest(item)} className="text-[#C5A880] hover:text-white text-[10px] uppercase tracking-widest border border-[#C5A880]/30 hover:border-white px-3 py-1 transition-colors whitespace-nowrap">View Details</button>
                            </td>
                          </>
                        )}
                        
                        {activeTab === 'bespoke' && (
                          <>
                            <td className="py-5 text-sm font-semibold">{item.name}</td>
                            <td className="py-5 text-sm text-white/70">{item.email}</td>
                            <td className="py-5 text-sm text-white/70">{item.phone}</td>
                            <td className="py-5 text-xs text-[#C5A880] uppercase tracking-widest">{item.garmentType}</td>
                            <td className="py-5 text-right">
                              <button onClick={() => setSelectedRequest(item)} className="text-[#C5A880] hover:text-white text-[10px] uppercase tracking-widest border border-[#C5A880]/30 hover:border-white px-3 py-1 transition-colors whitespace-nowrap">View Details</button>
                            </td>
                          </>
                        )}
                        
                        {activeTab === 'inquiries' && (
                          <>
                            <td className="py-5 text-sm font-semibold">{item.productName}</td>
                            <td className="py-5 text-sm text-white/70">{item.name}</td>
                            <td className="py-5 text-sm text-white/70">{item.email}</td>
                            <td className="py-5 text-right">
                              <button onClick={() => setSelectedRequest(item)} className="text-[#C5A880] hover:text-white text-[10px] uppercase tracking-widest border border-[#C5A880]/30 hover:border-white px-3 py-1 transition-colors whitespace-nowrap">View Details</button>
                            </td>
                          </>
                        )}
                        
                        {activeTab === 'newsletter' && (
                          <td className="py-5 text-sm font-semibold">{item.email}</td>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
            )}
          </div>
        )}

      </div>

      {/* Request Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1A1A1A] border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
              
              <h2 className="text-2xl font-serif uppercase tracking-widest text-[#C5A880] mb-6 border-b border-white/10 pb-4">
                {activeTab === 'orders' ? 'Order Details' : activeTab === 'bespoke' ? 'Bespoke Request Details' : 'Inquiry Details'}
              </h2>
              
              <div className="space-y-4 text-sm text-white/80">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTab === 'orders' ? (
                    <>
                      <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Date</span>{formatDate(selectedRequest.createdAt)}</div>
                      <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Order ID</span>{selectedRequest.id}</div>
                      <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Customer</span>{selectedRequest.customerInfo?.firstName} {selectedRequest.customerInfo?.lastName}</div>
                      <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Email</span>{selectedRequest.customerInfo?.email}</div>
                      <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Phone</span>{selectedRequest.customerInfo?.phone}</div>
                      <div className="md:col-span-2">
                        <span className="block text-[10px] text-white/40 uppercase tracking-widest mb-3">Order Timeline</span>
                        <div className="flex items-center gap-0">
                          {statusFlow.map((stage, i) => {
                            const history = Array.isArray(selectedRequest.statusHistory) ? selectedRequest.statusHistory : [];
                            const stageIdx = history.findIndex(h => h.status === stage);
                            const isReached = stageIdx !== -1;
                            const isCurrent = history.length > 0 && history[history.length - 1].status === stage;
                            return (
                              <div key={stage} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    isReached ? 'bg-[#C5A880] text-white' : 'bg-white/10 text-white/30'
                                  } ${isCurrent ? 'ring-2 ring-[#C5A880] ring-offset-2 ring-offset-[#1A1A1A]' : ''}`}>
                                    {isReached ? '✓' : i + 1}
                                  </div>
                                  <span className={`text-[8px] uppercase tracking-widest mt-1 whitespace-nowrap ${
                                    isReached ? 'text-[#C5A880]' : 'text-white/30'
                                  }`}>{stage}</span>
                                  {isReached && history[stageIdx]?.timestamp && (
                                    <span className="text-[7px] text-white/30 mt-0.5">{new Date(history[stageIdx].timestamp).toLocaleDateString()}</span>
                                  )}
                                </div>
                                {i < statusFlow.length - 1 && (
                                  <div className={`flex-1 h-[1px] mx-1 mt-[-1.5rem] ${statusFlow.slice(0, i + 1).every(s => history.find(h => h.status === s)) ? 'bg-[#C5A880]' : 'bg-white/10'}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 mt-4">
                        <span className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Items</span>
                        {selectedRequest.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                            <div className="flex items-center gap-4">
                              <img src={item.image} alt={item.name} onError={e => { if (e.target.src !== IMG_FALLBACK) e.target.src = IMG_FALLBACK; }} className="w-12 h-16 object-cover" />
                              <div>
                                <p className="text-sm">{item.name}</p>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest">Qty: {item.quantity} | Size: {item.size}</p>
                              </div>
                            </div>
                            <p className="text-sm">GHS {item.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>

                      <div className="md:col-span-2 mt-4 border-t border-white/10 pt-4 text-right">
                        <p className="text-sm text-white/60">Subtotal: GHS {selectedRequest.subtotal}</p>
                        <p className="text-sm text-white/60">Shipping: GHS {selectedRequest.shippingFee}</p>
                        <p className="text-sm text-white/60">Tax: GHS {selectedRequest.tax}</p>
                        <p className="text-lg font-serif mt-2">Total: GHS {selectedRequest.total}</p>
                      </div>
                      
                      <div className="md:col-span-2 mt-4">
                        <span className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Shipping Address</span>
                        <p className="text-sm text-white/80">{selectedRequest.customerInfo?.address}</p>
                        {selectedRequest.customerInfo?.apartment && <p className="text-sm text-white/80">{selectedRequest.customerInfo?.apartment}</p>}
                        <p className="text-sm text-white/80">{selectedRequest.customerInfo?.city}, {selectedRequest.customerInfo?.country} {selectedRequest.customerInfo?.postalCode}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Date</span>{formatDate(selectedRequest.createdAt)}</div>
                      <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Client Name</span>{selectedRequest.name}</div>
                      <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Email</span>{selectedRequest.email}</div>
                      {selectedRequest.phone && <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Phone Number</span>{selectedRequest.phone}</div>}
                      {selectedRequest.productName && <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Product Inquired</span><span className="text-[#C5A880]">{selectedRequest.productName}</span></div>}
                      {selectedRequest.garmentType && <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Garment Type</span>{selectedRequest.garmentType}</div>}
                      {selectedRequest.budget && <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Estimated Budget</span>{selectedRequest.budget}</div>}
                      {selectedRequest.timeline && <div><span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Target Timeline</span>{selectedRequest.timeline}</div>}
                    </>
                  )}
                </div>
                
                {selectedRequest.message && (
                  <div className="mt-8 border-t border-white/10 pt-6">
                    <span className="block text-[10px] text-white/40 uppercase tracking-widest mb-4">Message / Requirements</span>
                    <p className="whitespace-pre-wrap leading-relaxed text-white/90 bg-black/40 p-5 rounded-sm border border-white/5 font-light">{selectedRequest.message}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// We need AnimatePresence for the form
import { AnimatePresence } from 'framer-motion';

export default Admin;
