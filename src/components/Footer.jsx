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
            <a href="https://instagram.com/ikebee" target="_blank" rel="noreferrer" className="w-10 h-10 border border-secondary flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition-colors">
              In
            </a>
            <a href="https://tiktok.com/@ikebee" target="_blank" rel="noreferrer" className="w-10 h-10 border border-secondary flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition-colors">
              Ti
            </a>
            <a href="https://twitter.com/ikebee" target="_blank" rel="noreferrer" className="w-10 h-10 border border-secondary flex items-center justify-center text-secondary hover:bg-secondary hover:text-primary transition-colors">
              X
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
