import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LazyImage from '../components/LazyImage';
import ParallaxImage from '../components/ParallaxImage';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/api';

const LookbookItem = ({ img, title, category, index, slug }) => {
  const isEven = index % 2 === 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-full flex flex-col md:flex-row gap-gutter mb-section-gap items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
      <div className="w-full md:w-3/5 overflow-hidden aspect-[4/5] relative group">
        <ParallaxImage 
          src={img} 
          alt={title} 
          className="w-full h-full group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none"></div>
      </div>
      
      <div className={`w-full md:w-2/5 p-8 md:p-12 ${isEven ? 'text-left' : 'text-right'}`}>
        <span className="font-hanken text-label-sm text-secondary uppercase tracking-[0.3em] mb-4 block">
          {category}
        </span>
        <h2 className="font-bodoni text-display-xl text-primary mb-8 leading-tight">
          {title}
        </h2>
        <div className={`w-12 h-[1px] bg-secondary mb-8 ${isEven ? 'mr-auto' : 'ml-auto'}`}></div>
        <p className="font-hanken text-body-lg text-on-surface-variant leading-relaxed max-w-sm mb-12 ml-0 mr-0">
          An exploration of form, heritage, and the avant-garde. This piece reinterprets traditional silhouettes for the modern global landscape.
        </p>
        {slug && (
          <Link to={`/collection/${slug}`} className="font-hanken text-label-sm text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-all uppercase tracking-widest">
            View Details
          </Link>
        )}
      </div>
    </motion.div>
  );
};

const Lookbook = () => {
  const [editorialImages, setEditorialImages] = useState([
    {
      img: "/lookbook_1.png",
      title: "The Golden Empress",
      category: "Volume I • Ancestry",
      slug: "heritage-kente-gown"
    },
    {
      img: "/lookbook_2.png",
      title: "Obsidian Textures",
      category: "Volume II • Detail",
      slug: "obsidian-silk-suit"
    },
    {
      img: "/lookbook_3.png",
      title: "Lush Geometric",
      category: "Volume III • Landscape",
      slug: "midnight-batik-kimono"
    }
  ]);

  useEffect(() => {
    const fetchLookbook = async () => {
      try {
        const q = query(collection(db, 'lookbook'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              img: data.image,
              title: data.caption || 'Editorial Series',
              category: `Asset • ${new Date(data.createdAt?.toDate() || Date.now()).getFullYear()}`,
              slug: data.slug || null
            };
          });
          setEditorialImages(list);
        }
      } catch (error) {
        console.error("Error fetching lookbook:", error);
      }
    };
    fetchLookbook();
  }, []);

  return (
    <div className="bg-background pt-32 pb-section-gap overflow-hidden">
      {/* Redesigned Header with Featured Image */}
      <section className="px-margin-edge max-w-container-max mx-auto mb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="md:col-span-7"
          >
            <span className="font-hanken text-label-sm text-secondary uppercase tracking-[0.5em] mb-6 block">Editorial Series</span>
            <h1 className="font-bodoni text-[64px] sm:text-[100px] md:text-[150px] lg:text-[180px] text-primary leading-[0.85] mb-12 tracking-tighter relative z-10">
              LOOK <br/> BOOK
            </h1>
            <div className="max-w-md">
              <p className="font-hanken text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                A visual journey through the Ancestral Future collection. Witness the confluence of Ghanaian craftsmanship and global luxury.
              </p>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="mb-8"
              >
                <span className="font-hanken text-label-sm tracking-[0.2em] uppercase">Volume {new Date().getFullYear()}</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 1.1, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="md:col-span-5 relative mt-16 md:mt-0"
          >
            <div className="aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl">
              <ParallaxImage 
                src="/lookbook_header.png" 
                alt="Featured Editorial" 
                className="w-full h-full"
              />
            </div>
            {/* Decorative element overlapping the image */}
            <div className="absolute -bottom-8 -left-8 w-32 h-32 border-[0.5px] border-secondary z-20 hidden md:block"></div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-margin-edge max-w-container-max mx-auto">
        {editorialImages.map((item, index) => (
          <LookbookItem 
            key={item.id || index} 
            index={index}
            img={item.img} 
            title={item.title} 
            category={item.category} 
            slug={item.slug}
          />
        ))}
      </div>

      {/* Bottom Call to Action */}
      <section className="mt-24 py-section-gap bg-primary text-on-primary text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <span className="font-bodoni text-[400px] leading-none whitespace-nowrap">IKEBEE</span>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 px-margin-edge"
        >
          <h3 className="font-bodoni text-headline-lg mb-8 italic">Crafted for the Global Citizen</h3>
          <p className="font-hanken text-body-md text-on-primary/60 mb-12 max-w-lg mx-auto">
            Experience the full narrative of each piece. Our collection is more than fashion—it's a living heritage.
          </p>
          <Link to="/heritage" className="inline-block px-16 py-5 bg-secondary text-primary font-hanken text-label-sm tracking-widest hover:bg-white transition-colors duration-500">
            DISCOVER THE STORY
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Lookbook;
