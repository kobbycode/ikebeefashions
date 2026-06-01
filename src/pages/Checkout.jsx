import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../services/api';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { PaystackButton } from 'react-paystack';
import emailjs from '@emailjs/browser';
import AdminAlert from '../components/AdminAlert';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const [alertConfig, setAlertConfig] = useState(null);

  const customAlert = (message, type = 'info') => {
    return new Promise((resolve) => {
      setAlertConfig({
        message,
        type,
        isConfirm: false,
        onConfirm: () => {
          setAlertConfig(null);
          resolve(true);
        }
      });
    });
  };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('paystack'); // 'paystack' or 'cash'

  const shippingFee = formData.country ? (formData.country === 'GH' ? 50 : 300) : 0;
  const tax = cartTotal * 0.05;
  const finalTotal = cartTotal + shippingFee + tax;
  const isFormValid = formData.email && formData.firstName && formData.lastName && formData.address && formData.city && formData.country && formData.postalCode && formData.phone;

  // Paystack Configuration
  const publicKey = "pk_test_d8a8767f70b799e0df3e488102377c8efb471ba4"; // Replace with real public key
  const amount = finalTotal * 100; // Paystack expects amount in pesewas
  
  const componentProps = {
    email: formData.email,
    amount,
    currency: "GHS",
    metadata: {
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
    },
    publicKey,
    text: `PAY GHS ${finalTotal.toFixed(2)}`,
    onSuccess: () => handleSuccessPayment(),
    onClose: () => customAlert("Payment canceled. Your order has not been placed.", "danger"),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSuccessPayment = async () => {
    setLoading(true);

    try {
      // Create order object
      const order = {
        customerInfo: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
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
        status: 'paid',
        paymentMethod: 'paystack',
        createdAt: serverTimestamp(),
      };

      // Add to Firestore
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
          price: (item.price * item.quantity).toFixed(2),
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
        shipping_cost: shippingFee.toFixed(2),
        tax_cost: tax.toFixed(2),
        total_cost: finalTotal.toFixed(2),
        cost: {
          shipping: shippingFee.toFixed(2),
          tax: tax.toFixed(2),
          total: finalTotal.toFixed(2)
        },
        logo: window.location.origin + "/logo.jpeg",
        user_email: formData.email,
        recipient: formData.email,
        recipient_email: formData.email
      };
      
      // We will leave the Service ID as a placeholder to be filled once obtained
      await emailjs.send('service_csylkvj', 'template_hgjfxad', emailParams, 'VBWEkwRY-kFE8tLyS');
      
      setSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/');
      }, 5000);
      
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
          lastName: formData.lastName,
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
        status: 'pending', // Cash payments start as pending
        paymentMethod: 'cash_on_delivery',
        createdAt: serverTimestamp(),
      };

      // Add to Firestore
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
          price: (item.price * item.quantity).toFixed(2),
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
        shipping_cost: shippingFee.toFixed(2),
        tax_cost: tax.toFixed(2),
        total_cost: finalTotal.toFixed(2),
        cost: {
          shipping: shippingFee.toFixed(2),
          tax: tax.toFixed(2),
          total: finalTotal.toFixed(2)
        },
        logo: window.location.origin + "/logo.jpeg",
        user_email: formData.email,
        recipient: formData.email,
        recipient_email: formData.email
      };
      
      await emailjs.send('service_csylkvj', 'template_hgjfxad', emailParams, 'VBWEkwRY-kFE8tLyS');
      
      setSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/');
      }, 5000);
      
    } catch (error) {
      console.error("Error creating cash order: ", error);
      customAlert(`Error: ${error.text || error.message || "There was an issue processing your order. Please contact support."}`, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Do nothing here, the PaystackButton handles the submit action via its onClick/onSuccess
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-margin-edge flex flex-col items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl text-center"
        >
          <span className="material-symbols-outlined text-[80px] text-primary mb-8">check_circle</span>
          <h1 className="font-bodoni text-display-sm text-primary mb-6">Order Received</h1>
          <p className="font-hanken text-body-lg text-on-surface-variant mb-12">
            Thank you for your purchase. Your order has been successfully placed and is now being processed. 
            We will send a confirmation email to {formData.email} shortly.
          </p>
          <Link to="/" className="inline-block px-12 py-4 bg-primary text-white font-hanken text-label-sm uppercase tracking-widest hover:bg-secondary transition-colors duration-300">
            Return to Homepage
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
      <AdminAlert config={alertConfig} />
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
                  className="w-full bg-transparent border border-primary/20 p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md"
                />
              </div>
              <div className="mb-4">
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number" 
                  required
                  className="w-full bg-transparent border border-primary/20 p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md"
                />
              </div>
            </section>

            {/* Shipping Section */}
            <section>
              <h3 className="text-label-lg text-primary uppercase tracking-widest mb-6 border-b border-primary/20 pb-2">Shipping Address</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name" 
                  required
                  className="w-full bg-transparent border border-primary/20 p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md"
                />
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name" 
                  required
                  className="w-full bg-transparent border border-primary/20 p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md"
                />
              </div>

              <div className="mb-4">
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address" 
                  required
                  className="w-full bg-transparent border border-primary/20 p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md"
                />
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
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City" 
                  required
                  className="w-full bg-transparent border border-primary/20 p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md"
                />
                <select 
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border border-primary/20 p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md appearance-none"
                >
                  <option value="" disabled>Country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="GH">Ghana</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="OTHER">Other</option>
                </select>
                <input 
                  type="text" 
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code" 
                  required
                  className="w-full bg-transparent border border-primary/20 p-4 outline-none focus:border-primary transition-colors font-hanken text-body-md"
                />
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
                  <PaystackButton 
                    {...componentProps}
                    className="w-full py-5 bg-primary text-white font-hanken text-label-md uppercase tracking-widest hover:bg-secondary transition-colors duration-300 flex items-center justify-center gap-2"
                  />
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={handleCashPayment}
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
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
