import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../services/api';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { PaystackButton } from 'react-paystack';
import emailjs from '@emailjs/browser';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { playChime } from '../utils/notification';
import { createNotification } from '../utils/notifications';
import { validateEmail, validatePhone } from '../utils/validation';

const SAVED_DETAILS_KEY = 'ikebee_checkout_details';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [saveDetails, setSaveDetails] = useState(true);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_DETAILS_KEY) || 'null');
      if (saved) {
        const { email, name, address, apartment, city, country, postalCode, phone } = saved;
        return {
          email: email || '',
          firstName: name || '',
          address: address || '',
          apartment: apartment || '',
          city: city || '',
          country: country || '',
          postalCode: postalCode || '',
          phone: phone || '',
        };
      }
    } catch {}
    return {
      email: '',
      firstName: '',
      address: '',
      apartment: '',
      city: '',
      country: '',
      postalCode: '',
      phone: '',
    };
  });
  const [paymentMethod, setPaymentMethod] = useState('paystack');

  const shippingFee = formData.country ? (formData.country === 'GH' ? 50 : 300) : 0;
  const tax = cartTotal * 0.05;
  const finalTotal = cartTotal + shippingFee + tax;
  const isFormValid = formData.email && formData.firstName && formData.address && formData.city && formData.country && formData.postalCode && formData.phone && Object.keys(fieldErrors).length === 0;

  // Paystack Configuration
  const publicKey = "pk_test_d8a8767f70b799e0df3e488102377c8efb471ba4"; // Replace with real public key
  const amount = finalTotal * 100; // Paystack expects amount in pesewas
  
  const componentProps = {
    email: formData.email,
    amount,
    currency: "GHS",
    metadata: {
      name: formData.firstName,
      phone: formData.phone,
    },
    publicKey,
    text: `PAY GHS ${finalTotal.toFixed(2)}`,
    onSuccess: () => handleSuccessPayment(),
    onClose: () => showAlert("Payment canceled. Your order has not been placed.", "danger", "Payment Canceled"),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSuccessPayment = async () => {
    setLoading(true);

    try {
      // Create order object
      const order = {
        customerInfo: {
          email: formData.email,
          firstName: formData.firstName,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode,
          phone: formData.phone,
        },
        items: cart,
        subtotal: cartTotal,
        shipping: shippingFee,
        tax: tax,
        totalAmount: finalTotal,
        status: 'pending',
        paymentMethod: 'paystack',
        userId: user?.uid || null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), order);
      
      // Format items for EmailJS
      const formattedItems = cart.map(item => {
        let imageUrl = item.image || "";
        if (imageUrl.startsWith('/')) {
          imageUrl = window.location.origin + imageUrl;
        }
        return {
          name: item.title || item.name,
          units: item.quantity,
          price: `GHS ${(item.price * item.quantity).toFixed(2)}`,
          item: imageUrl
        };
      });
      
      // Send Confirmation Email
      const orderHtml = cart.map(item => `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title || item.name} (x${item.quantity})</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">GHS ${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('');
      const orderDetails = cart.map(item => `${item.title || item.name} (x${item.quantity}) - GHS ${(item.price * item.quantity).toFixed(2)}`).join('\n');

      const emailParams = {
        to_name: formData.firstName,
        to_email: formData.email,
        email: formData.email,
        reply_to: formData.email,
        order_id: docRef.id.slice(0, 8).toUpperCase(),
        orders: formattedItems,
        order_html: `<table style="width: 100%; border-collapse: collapse;">${orderHtml}</table>`,
        order_details: orderDetails,
        shipping_cost: `GHS ${shippingFee.toFixed(2)}`,
        tax_cost: `GHS ${tax.toFixed(2)}`,
        total_cost: `GHS ${finalTotal.toFixed(2)}`,
        cost: {
          shipping: `GHS ${shippingFee.toFixed(2)}`,
          tax: `GHS ${tax.toFixed(2)}`,
          total: `GHS ${finalTotal.toFixed(2)}`
        },
        logo: window.location.origin + "/logo.jpeg",
        user_email: formData.email,
        recipient: formData.email,
        recipient_email: formData.email
      };
      
      // We will leave the Service ID as a placeholder to be filled once obtained
      await emailjs.send('service_csylkvj', 'template_hgjfxad', emailParams, 'VBWEkwRY-kFE8tLyS');
      
      setOrderId(docRef.id);
      setSuccess(true);
      playChime();
      createNotification({
        type: 'new_order',
        message: `New order #${docRef.id.slice(0, 8).toUpperCase()} — ${formData.firstName}`,
        recipientId: 'admin',
        recipientType: 'admin',
        orderId: docRef.id,
        customerName: formData.firstName,
        amount: finalTotal,
      });
      if (user?.uid) {
        createNotification({
          type: 'new_order',
          message: `Order #${docRef.id.slice(0, 8).toUpperCase()} placed successfully`,
          recipientId: user.uid,
          recipientType: 'customer',
          orderId: docRef.id,
        });
      }
      clearCart();
      persistDetails();
      
      setTimeout(() => {
        navigate('/');
      }, 7000);
      
    } catch (error) {
      console.error("Error creating order: ", error);
      customAlert(`Error: ${error.text || error.message || "There was an issue processing your order. Please contact support."}`, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    setLoading(true);

    try {
      // Create order object
      const order = {
        customerInfo: {
          email: formData.email,
          firstName: formData.firstName,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode,
          phone: formData.phone,
        },
        items: cart,
        subtotal: cartTotal,
        shipping: shippingFee,
        tax: tax,
        totalAmount: finalTotal,
        status: 'pending',
        paymentMethod: 'cash_on_delivery',
        userId: user?.uid || null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), order);
      
      // Format items for EmailJS
      const formattedItems = cart.map(item => {
        let imageUrl = item.image || "";
        if (imageUrl.startsWith('/')) {
          imageUrl = window.location.origin + imageUrl;
        }
        return {
          name: item.title || item.name,
          units: item.quantity,
          price: `GHS ${(item.price * item.quantity).toFixed(2)}`,
          item: imageUrl
        };
      });
      
      // Send Confirmation Email
      const orderHtml = cart.map(item => `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title || item.name} (x${item.quantity})</td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">GHS ${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('');
      const orderDetails = cart.map(item => `${item.title || item.name} (x${item.quantity}) - GHS ${(item.price * item.quantity).toFixed(2)}`).join('\n');

      const emailParams = {
        to_name: formData.firstName,
        to_email: formData.email,
        email: formData.email,
        reply_to: formData.email,
        order_id: docRef.id.slice(0, 8).toUpperCase(),
        orders: formattedItems,
        order_html: `<table style="width: 100%; border-collapse: collapse;">${orderHtml}</table>`,
        order_details: orderDetails,
        shipping_cost: `GHS ${shippingFee.toFixed(2)}`,
        tax_cost: `GHS ${tax.toFixed(2)}`,
        total_cost: `GHS ${finalTotal.toFixed(2)}`,
        cost: {
          shipping: `GHS ${shippingFee.toFixed(2)}`,
          tax: `GHS ${tax.toFixed(2)}`,
          total: `GHS ${finalTotal.toFixed(2)}`
        },
        logo: window.location.origin + "/logo.jpeg",
        user_email: formData.email,
        recipient: formData.email,
        recipient_email: formData.email
      };
      
      await emailjs.send('service_csylkvj', 'template_hgjfxad', emailParams, 'VBWEkwRY-kFE8tLyS');
      
      setOrderId(docRef.id);
      setSuccess(true);
      playChime();
      createNotification({
        type: 'new_order',
        message: `New order #${docRef.id.slice(0, 8).toUpperCase()} — ${formData.firstName}`,
        recipientId: 'admin',
        recipientType: 'admin',
        orderId: docRef.id,
        customerName: formData.firstName,
        amount: finalTotal,
      });
      if (user?.uid) {
        createNotification({
          type: 'new_order',
          message: `Order #${docRef.id.slice(0, 8).toUpperCase()} placed successfully`,
          recipientId: user.uid,
          recipientType: 'customer',
          orderId: docRef.id,
        });
      }
      clearCart();
      persistDetails();
      
      setTimeout(() => {
        navigate('/');
      }, 7000);
      
    } catch (error) {
      console.error("Error creating cash order: ", error);
      customAlert(`Error: ${error.text || error.message || "There was an issue processing your order. Please contact support."}`, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!password || password.length < 6) {
      setAccountError('Password must be at least 6 characters.');
      return;
    }
    setAccountError('');
    setAccountLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, password);
      if (orderId) {
        await updateDoc(doc(db, 'orders', orderId), { userId: cred.user.uid });
        createNotification({
          type: 'new_order',
          message: `Order #${orderId.slice(0, 8).toUpperCase()} placed successfully`,
          recipientId: cred.user.uid,
          recipientType: 'customer',
          orderId: orderId,
        });
      }
      setAccountCreated(true);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setAccountError('An account with this email already exists. Please sign in.');
      } else {
        setAccountError(err.message);
      }
    } finally {
      setAccountLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setFieldErrors(prev => ({ ...prev, address: 'Geolocation is not supported by your browser.' }));
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const displayName = data.display_name || '';
          setFormData(prev => ({
            ...prev,
            address: displayName || prev.address,
            city: addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.county || prev.city,
            country: getCountryFromAddr(addr.country_code) || prev.country,
            postalCode: addr.postcode || prev.postalCode,
          }));
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.address; delete next.city; delete next.country; delete next.postalCode;
            return next;
          });
        } catch {
          setFieldErrors(prev => ({ ...prev, address: 'Could not retrieve address from location.' }));
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setFieldErrors(prev => ({ ...prev, address: 'Location access denied or unavailable.' }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getCountryFromAddr = (code) => {
    if (!code) return '';
    const map = { gb: 'UK', gh: 'GH', us: 'US', ca: 'CA', au: 'AU' };
    return map[code.toLowerCase()] || code.toUpperCase();
  };

  const persistDetails = () => {
    if (!saveDetails) {
      localStorage.removeItem(SAVED_DETAILS_KEY);
      return;
    }
    const data = {
      email: formData.email,
      name: formData.firstName,
      address: formData.address,
      apartment: formData.apartment,
      city: formData.city,
      country: formData.country,
      postalCode: formData.postalCode,
      phone: formData.phone,
    };
    localStorage.setItem(SAVED_DETAILS_KEY, JSON.stringify(data));
  };

  const getCountryCode = (country) => {
    const map = { US: 'US', UK: 'GB', GH: 'GH', CA: 'CA', AU: 'AU' };
    return map[country] || '';
  };

  const validateForm = () => {
    const errors = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;
    const phoneErr = validatePhone(formData.phone, getCountryCode(formData.country));
    if (phoneErr) errors.phone = phoneErr;
    if (!formData.firstName) errors.firstName = 'Name is required.';
    if (!formData.address) errors.address = 'Address is required.';
    if (!formData.city) errors.city = 'City is required.';
    if (!formData.country) errors.country = 'Country is required.';
    if (!formData.postalCode) errors.postalCode = 'Postal code is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    validateForm();
  };

  const handlePayClick = (e) => {
    if (!validateForm()) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleCashClick = (e) => {
    if (!validateForm()) return;
    handleCashPayment();
  };

  if (success) {
    const statusFlow = ['pending', 'packing', 'delivering', 'delivered'];
    return (
      <div className="min-h-screen pt-32 pb-20 px-margin-edge flex flex-col items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl text-center"
        >
          <span className="material-symbols-outlined text-[80px] text-primary mb-8">check_circle</span>
          <h1 className="font-bodoni text-display-sm text-primary mb-6">Order Received</h1>
          <p className="font-hanken text-body-lg text-on-surface-variant mb-6">
            Thank you for your purchase. Your order has been successfully placed and is now being processed. 
            We will send a confirmation email to {formData.email} shortly.
          </p>

          {/* Order ID */}
          {orderId && (
            <p className="font-hanken text-xs text-on-surface-variant uppercase tracking-widest mb-10">
              Order reference: <span className="text-secondary font-semibold">{orderId.slice(0, 8).toUpperCase()}</span>
            </p>
          )}

          {/* Status Timeline for Customer */}
          <div className="bg-surface/30 border border-primary/10 p-8 mb-10 text-left">
            <h3 className="font-hanken text-[10px] uppercase tracking-widest text-primary mb-6 text-center">Order Progress</h3>
            <div className="flex items-center gap-0 max-w-sm mx-auto">
              {statusFlow.map((stage, i) => (
                <div key={stage} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      stage === 'pending' ? 'bg-secondary text-white ring-2 ring-secondary ring-offset-2 ring-offset-background' : 'bg-white/10 text-white/30'
                    }`}>
                      {stage === 'pending' ? '1' : i + 1}
                    </div>
                    <span className={`text-[9px] uppercase tracking-widest mt-2 whitespace-nowrap ${
                      stage === 'pending' ? 'text-secondary' : 'text-white/30'
                    }`}>{stage}</span>
                  </div>
                  {i < statusFlow.length - 1 && (
                    <div className={`flex-1 h-[1px] mx-2 mt-[-1.5rem] ${stage === 'pending' ? 'bg-white/10' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="font-hanken text-[10px] text-on-surface-variant text-center mt-6">
              We will update this status as your order progresses. Check your email for updates.
            </p>
          </div>

          {/* Account Creation for Guest Users */}
          {!user && !accountCreated && !showPasswordForm && (
            <div className="mb-10">
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full py-4 bg-secondary text-white font-hanken text-xs uppercase tracking-widest hover:bg-secondary/80 transition-colors"
              >
                Create Account to Track Orders
              </button>
              <p className="font-hanken text-[10px] text-on-surface-variant mt-3">
                Set a password to access your order history and get real-time updates.
              </p>
            </div>
          )}

          {!user && !accountCreated && showPasswordForm && (
            <div className="bg-surface/30 border border-primary/10 p-8 mb-10 text-left">
              <h3 className="font-hanken text-[10px] uppercase tracking-widest text-primary mb-4">Create Your Password</h3>
              <p className="font-hanken text-xs text-on-surface-variant mb-6">
                Account will be created for <strong className="text-primary">{formData.email}</strong>
              </p>
              {accountError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center p-3 mb-4 uppercase tracking-widest">
                  {accountError}
                </div>
              )}
              <div className="flex gap-3">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 chars)"
                  className="flex-1 bg-transparent border border-primary/20 px-4 py-3 text-primary text-sm focus:outline-none focus:border-secondary font-hanken"
                />
                <button
                  onClick={handleCreateAccount}
                  disabled={accountLoading}
                  className="px-6 py-3 bg-secondary text-white font-hanken text-xs uppercase tracking-widest hover:bg-secondary/80 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {accountLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {accountCreated && (
            <div className="bg-green-900/20 border border-green-500/30 p-6 mb-10 text-center">
              <span className="material-symbols-outlined text-green-400 text-2xl mb-2">verified</span>
              <p className="font-hanken text-xs text-green-400 uppercase tracking-widest font-semibold">Account Created!</p>
              <p className="font-hanken text-[10px] text-green-300/70 mt-1">
                You can now track your orders in real-time.
              </p>
            </div>
          )}

          <Link to={accountCreated ? '/account' : '/'} className="inline-block px-12 py-4 bg-primary text-white font-hanken text-label-sm uppercase tracking-widest hover:bg-secondary transition-colors duration-300">
            {accountCreated ? 'Go to My Account' : 'Return to Homepage'}
          </Link>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-margin-edge flex flex-col items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="material-symbols-outlined text-[64px] text-primary mb-6 opacity-50">shopping_bag</span>
          <h1 className="font-bodoni text-headline-lg text-primary mb-4 italic">Your Bag is Empty</h1>
          <p className="font-hanken text-body-md text-on-surface-variant mb-10 max-w-md mx-auto">
            You need to add items to your bag before proceeding to checkout.
          </p>
          <Link to="/collection" className="inline-block px-12 py-4 bg-primary text-white font-hanken text-label-sm uppercase tracking-widest hover:bg-secondary transition-colors duration-300">
            Discover Collection
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-margin-edge font-hanken">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
        
        {/* Left Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-3/5"
        >
          <h2 className="font-bodoni text-headline-md text-primary mb-10 italic">Checkout</h2>
          
          <form onSubmit={handleFormSubmit} className="space-y-12">
            
            {/* Contact Section */}
            <section>
              <h3 className="text-label-lg text-primary uppercase tracking-widest mb-6 border-b border-primary/20 pb-2">Contact Information</h3>
              <div className="mb-4">
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address" 
                  required
                  className={`w-full bg-transparent border p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md ${fieldErrors.email ? 'border-red-500' : 'border-primary/20'}`}
                />
                {fieldErrors.email && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-widest">{fieldErrors.email}</p>}
              </div>
              <div className="mb-4">
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number" 
                  required
                  className={`w-full bg-transparent border p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md ${fieldErrors.phone ? 'border-red-500' : 'border-primary/20'}`}
                />
                {fieldErrors.phone && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-widest">{fieldErrors.phone}</p>}
              </div>
            </section>

            {/* Shipping Section */}
            <section>
              <h3 className="text-label-lg text-primary uppercase tracking-widest mb-6 border-b border-primary/20 pb-2">Shipping Details</h3>
              
              <div className="mb-4">
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Name" 
                  required
                  className={`w-full bg-transparent border p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md ${fieldErrors.firstName ? 'border-red-500' : 'border-primary/20'}`}
                />
                {fieldErrors.firstName && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-widest">{fieldErrors.firstName}</p>}
              </div>

              <div className="mb-4">
                <div className="flex gap-2 items-start">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Location / Address" 
                      required
                      className={`w-full bg-transparent border p-4 pr-12 outline-none focus:border-primary transition-colors font-hanken text-body-md ${fieldErrors.address ? 'border-red-500' : 'border-primary/20'}`}
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
                      title="Get current location"
                    >
                      {locationLoading ? (
                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-lg">my_location</span>
                      )}
                    </button>
                  </div>
                </div>
                {fieldErrors.address && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-widest">{fieldErrors.address}</p>}
              </div>

              <div className="mb-4">
                <input 
                  type="text" 
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc. (optional)" 
                  className="w-full bg-transparent border border-primary/20 p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City" 
                    required
                    className={`w-full bg-transparent border p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md ${fieldErrors.city ? 'border-red-500' : 'border-primary/20'}`}
                  />
                  {fieldErrors.city && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-widest">{fieldErrors.city}</p>}
                </div>
                <div>
                  <select 
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className={`w-full bg-transparent border p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md appearance-none ${fieldErrors.country ? 'border-red-500' : 'border-primary/20'}`}
                  >
                    <option value="" disabled>Country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="GH">Ghana</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {fieldErrors.country && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-widest">{fieldErrors.country}</p>}
                </div>
                <div>
                  <input 
                    type="text" 
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Postal code" 
                    required
                    className={`w-full bg-transparent border p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md ${fieldErrors.postalCode ? 'border-red-500' : 'border-primary/20'}`}
                  />
                  {fieldErrors.postalCode && <p className="text-red-400 text-[10px] mt-1 uppercase tracking-widest">{fieldErrors.postalCode}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-2 border-t border-primary/10">
                <input
                  type="checkbox"
                  id="saveDetails"
                  checked={saveDetails}
                  onChange={e => setSaveDetails(e.target.checked)}
                  className="appearance-none w-4 h-4 border border-primary/40 bg-transparent checked:bg-secondary checked:border-secondary cursor-pointer shrink-0 mt-0.5"
                />
                <label htmlFor="saveDetails" className="font-hanken text-xs text-on-surface-variant cursor-pointer select-none">
                  Save my details for next time
                </label>
              </div>
            </section>

            {/* Payment Method Selector */}
            <section className="mb-8">
              <h2 className="font-bodoni text-headline-sm text-primary mb-6 italic">Payment Method</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className={`flex-1 flex items-center justify-center p-4 border cursor-pointer transition-colors ${paymentMethod === 'paystack' ? 'border-primary bg-primary/5' : 'border-primary/20 hover:border-primary/50'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="paystack" 
                    checked={paymentMethod === 'paystack'} 
                    onChange={() => setPaymentMethod('paystack')}
                    className="hidden"
                  />
                  <span className="font-hanken text-label-md uppercase tracking-widest text-primary">Pay with Card / Momo</span>
                </label>
                <label className={`flex-1 flex items-center justify-center p-4 border cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-primary/20 hover:border-primary/50'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cash" 
                    checked={paymentMethod === 'cash'} 
                    onChange={() => setPaymentMethod('cash')}
                    className="hidden"
                  />
                  <span className="font-hanken text-label-md uppercase tracking-widest text-primary">Pay Physical Cash</span>
                </label>
              </div>
            </section>

            {/* Payment Button */}
            <section className="pt-6">
              {loading ? (
                <div className="w-full py-5 bg-primary text-white font-hanken text-label-md uppercase tracking-widest flex items-center justify-center gap-2 opacity-70">
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  PROCESSING...
                </div>
              ) : paymentMethod === 'paystack' ? (
                <div className={!isFormValid ? "opacity-50 pointer-events-none" : ""}>
                  <div onClick={handlePayClick}>
                    <PaystackButton 
                      {...componentProps}
                      className="w-full py-5 bg-primary text-white font-hanken text-label-md uppercase tracking-widest hover:bg-secondary transition-colors duration-300 flex items-center justify-center gap-2"
                    />
                  </div>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={handleCashClick}
                  disabled={!isFormValid}
                  className={`w-full py-5 text-white font-hanken text-label-md uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-2 ${isFormValid ? 'bg-primary hover:bg-secondary' : 'bg-primary/50 cursor-not-allowed'}`}
                >
                  PLACE ORDER (PAY ON DELIVERY)
                </button>
              )}
            </section>
          </form>
        </motion.div>

        {/* Right Summary Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-2/5"
        >
          <div className="sticky top-32 bg-surface/30 p-8 border border-primary/10">
            <h3 className="font-bodoni text-headline-sm text-primary mb-8 italic">Order Summary</h3>
            
            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-28 bg-surface shrink-0">
                    <img src={item.image} alt={item.name} onError={e => { e.target.style.display = 'none'; }} className="w-full h-full object-cover" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-secondary text-white text-xs flex items-center justify-center rounded-full font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h4 className="font-hanken font-medium text-primary text-sm uppercase tracking-widest mb-1">
                      {item.title || item.name}
                    </h4>
                    <p className="font-hanken text-xs text-on-surface-variant uppercase tracking-widest mb-2">
                      {item.category}
                    </p>
                    <p className="font-bodoni text-md text-primary">
                      GHS {item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-primary/20 pt-6 space-y-4">
              <div className="flex justify-between font-hanken text-body-md text-on-surface-variant">
                <span>Subtotal</span>
                <span>GHS {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-hanken text-body-md text-on-surface-variant">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? (formData.country ? 'Free' : 'Select Country') : `GHS ${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-hanken text-body-md text-on-surface-variant">
                <span>Estimated taxes (5%)</span>
                <span>GHS {tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-primary/20 mt-6 pt-6 flex justify-between items-center">
                <span className="font-hanken text-label-lg uppercase tracking-widest text-primary">Total</span>
                <span className="font-bodoni text-3xl text-primary">GHS {finalTotal.toFixed(2)}</span>
              </div>
            </div>
            
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};

export default Checkout;
