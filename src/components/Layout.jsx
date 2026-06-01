import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BackToTopBtn from './BackToTopBtn';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="bg-background min-h-screen selection:bg-secondary selection:text-on-primary">
      {!isAdmin && <Navbar />}
      <main>{children}</main>
      {!isAdmin && (
        <>
          <Footer />
          <BackToTopBtn />

          {/* WhatsApp Floating Button */}
          <a className="fixed bottom-10 right-10 z-[60] group flex items-center gap-3" href="https://wa.me/233000000000" target="_blank" rel="noopener noreferrer">
            <span className="bg-background text-primary border border-primary px-4 py-2 font-hanken text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">CHAT WITH A STYLIST</span>
            <div className="w-16 h-16 bg-primary text-on-primary flex items-center justify-center rounded-none border border-secondary/30 hover:bg-secondary transition-all duration-300">
              <span className="material-symbols-outlined scale-125">chat_bubble</span>
            </div>
          </a>
        </>
      )}
    </div>
  );
};

export default Layout;
