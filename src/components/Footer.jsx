import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-on-primary w-full relative mt-section-gap overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>
      
      <div className="grid grid-cols-12 gap-gutter px-margin-edge py-24 w-full max-w-container-max mx-auto relative z-10">
        {/* Brand Narrative */}
        <div className="col-span-12 md:col-span-4 mb-16 md:mb-0">
          <Link to="/" className="block mb-8">
            <img src="/logo.jpeg" alt="IKEBEE" className="h-20 w-auto object-contain" />
          </Link>
          <p className="font-hanken text-body-lg text-on-primary/50 max-w-xs leading-relaxed italic mb-8">
            "A dialogue between ancestral echoes and the rhythm of tomorrow."
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-[1px] bg-secondary self-center"></div>
            <span className="font-hanken text-label-sm text-secondary tracking-widest uppercase">Ghanaian Heritage</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="col-span-6 md:col-span-2">
          <h5 className="font-hanken text-label-sm text-on-primary mb-8 uppercase tracking-widest">Collections</h5>
          <ul className="space-y-4">
            <li><Link to="/collection" className="font-hanken text-body-md text-on-primary/40 hover:text-secondary transition-colors duration-300">FW/24 Preview</Link></li>
            <li><Link to="/bespoke" className="font-hanken text-body-md text-on-primary/40 hover:text-secondary transition-colors duration-300">Bespoke Couture</Link></li>
            <li><Link to="/accessories" className="font-hanken text-body-md text-on-primary/40 hover:text-secondary transition-colors duration-300">Accessories</Link></li>
            <li><Link to="/heritage" className="font-hanken text-body-md text-on-primary/40 hover:text-secondary transition-colors duration-300">Heritage Series</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div className="col-span-6 md:col-span-2">
          <h5 className="font-hanken text-label-sm text-on-primary mb-8 uppercase tracking-widest">Maison</h5>
          <ul className="space-y-4">
            <li><Link to="/sustainability" className="font-hanken text-body-md text-on-primary/40 hover:text-secondary transition-colors duration-300">Sustainability</Link></li>
            <li><Link to="/shipping" className="font-hanken text-body-md text-on-primary/40 hover:text-secondary transition-colors duration-300">Shipping & Returns</Link></li>
            <li><Link to="/privacy" className="font-hanken text-body-md text-on-primary/40 hover:text-secondary transition-colors duration-300">Privacy Policy</Link></li>
            <li><Link to="/terms" className="font-hanken text-body-md text-on-primary/40 hover:text-secondary transition-colors duration-300">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Social & Legal */}
        <div className="col-span-12 md:col-span-4 mt-16 md:mt-0 md:pl-12 border-l border-white/5">
          <h5 className="font-hanken text-label-sm text-on-primary mb-8 uppercase tracking-widest">Connect</h5>
          <div className="flex gap-4 mb-12">
            <a href="https://facebook.com/ikebee" target="_blank" rel="noreferrer" className="w-10 h-10 border border-secondary flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition-colors" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://tiktok.com/@ikebee" target="_blank" rel="noreferrer" className="w-10 h-10 border border-secondary flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition-colors" aria-label="TikTok">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
          </div>
          
          <div className="space-y-4 pt-8 border-t border-white/5">
            <p className="font-hanken text-label-sm text-on-primary/30 uppercase tracking-widest text-[10px]">
              &copy; {new Date().getFullYear()} IKEBEE FASHION. ALL RIGHTS RESERVED.
            </p>
            <p className="font-hanken text-label-sm text-on-primary/20 uppercase tracking-widest text-[9px]">
              Crafted in Accra • Curated for the World
            </p>
          </div>
        </div>
      </div>

      {/* Large Decorative Text (Background) */}
      <div className="absolute -bottom-12 -right-12 opacity-[0.03] select-none pointer-events-none">
        <span className="font-bodoni text-[240px] text-white leading-none">IKEBEE</span>
      </div>
    </footer>
  );
};

export default Footer;
