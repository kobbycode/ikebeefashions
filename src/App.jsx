import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';
import Home from './pages/Home';
import Bespoke from './pages/Bespoke';
import Collection from './pages/Collection';
import Lookbook from './pages/Lookbook';
import Heritage from './pages/Heritage';
import NotFound from './pages/NotFound';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Splash from './components/Splash';
import {
  Sustainability,
  Shipping,
  Privacy,
  Terms,
  Accessories,
} from './pages/UtilityPages';
import PageTransition from './components/PageTransition';
import { CartProvider } from './context/CartContext';
import { AlertProvider } from './context/AlertContext';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/"               element={<Home />} />
          <Route path="/collection"           element={<Collection />} />
          <Route path="/collection/:slug"     element={<ProductDetail />} />
          <Route path="/bespoke"              element={<Bespoke />} />
          <Route path="/lookbook"             element={<Lookbook />} />
          <Route path="/heritage"             element={<Heritage />} />
          <Route path="/checkout"             element={<Checkout />} />
          <Route path="/accessories"          element={<Accessories />} />
          <Route path="/sustainability"       element={<Sustainability />} />
          <Route path="/shipping"             element={<Shipping />} />
          <Route path="/privacy"              element={<Privacy />} />
          <Route path="/terms"               element={<Terms />} />
          <Route path="/admin"               element={<Admin />} />
          {/* Catch-all 404 */}
          <Route path="*"                    element={<NotFound />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <CartProvider>
      <Router>
        <AlertProvider>
          <SmoothScroll>
            <ScrollToTop />
            <AnimatePresence mode="wait">
              {showSplash ? (
                <Splash key="splash" onComplete={() => setShowSplash(false)} />
              ) : (
                <Layout key="layout">
                  <AnimatedRoutes />
                </Layout>
              )}
            </AnimatePresence>
          </SmoothScroll>
        </AlertProvider>
      </Router>
    </CartProvider>
  );
}

export default App;
