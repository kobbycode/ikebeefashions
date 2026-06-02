import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { subscribeNewsletter } from '../services/api';
import SEO from '../components/SEO';
import ParallaxImage from '../components/ParallaxImage';

const Home = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      try {
        await subscribeNewsletter(email);
        setSubscribed(true);
        setEmail('');
      } catch (error) {
        console.error("Subscription failed", error);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="overflow-hidden">
      <SEO title="Home" />
      {/* Full Screen Hero */}
      <section className="relative h-screen w-full overflow-hidden bg-primary">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            alt="Hero" 
            className="w-full h-full object-cover" 
            src="/lookbook_1.png" 
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
        <div className="relative z-10 h-full flex flex-col justify-end px-margin-edge pb-section-gap max-w-container-max mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="font-hanken text-label-sm text-secondary mb-4 block tracking-widest uppercase">PREVIEW FW/24</span>
            <h2 className="font-bodoni text-display-xl text-white mb-8 leading-none">The Ancestral <br/>Future.</h2>
            <Link to="/collection" className="group relative inline-block px-12 py-4 bg-primary text-white border border-white/20 overflow-hidden transition-all duration-300">
              <span className="relative z-10 font-hanken text-label-sm">EXPLORE COLLECTION</span>
              <div className="absolute inset-0 bg-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Narrative Section: The Soul of Ghana */}
      <section className="py-section-gap px-margin-edge max-w-container-max mx-auto overflow-hidden">
        <div className="grid grid-cols-12 gap-gutter items-center">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="col-span-12 md:col-span-7 relative"
          >
            <div className="aspect-[4/5] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              <ParallaxImage 
                alt="Artisanal Details" 
                className="w-full h-full" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVWPGl5QqpiACDck_w3aSEiT1QgF-q8xIJu8sCxl4-MgO6cZTWrf0-h1owi0uQoqiK2DCGwVQg6w_PyikWvgFD9ydehilwi0Ko3M5WQB400jQB0V7Gz3Iwqd_YaxfF25hPrV_m3dV9-OD0XGEkm6zCn3H9Ozx1eIgaZCx2muultMV8ooY6WA8aLUtcxkHZpnnuRw2MwbX4ok9U-yEicxq42JxYlWwCqUYbqlU_wqkyjSXjLpUZ3qHHCsWXVGg6FwyznsSZdmd-xKs" 
              />
            </div>
            <div className="absolute -bottom-12 -right-12 hidden md:block w-64 aspect-square border-[0.5px] border-secondary p-4 bg-background z-20 shadow-2xl">
              <ParallaxImage 
                alt="Editorial Detail" 
                className="w-full h-full" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtdYeU4nH9UXRaAKnqD-I-BBatXouQ7hQf1Hgaq5NP5-jEOu8_Ob8OlgU4sbXeJtCm0Yj3QuILQVLnePdEbQIqGDjnMP2AJrE0bMeqKKhVpVCGN7SpPJnFWqrTmG6XY9AhiNT62M3bFGsuv7T32Md0wAae481Fx1vvkhIV3hPj9bQFyhoV_ltaTFoQZSQ0eF-AIdx1qmp58Gs5F4GVvt2HH-sPq3hAoTIF_bjTSIJskRMQU9se5sfDNtPwS9TFkC7SFaz1nZcZ6VQ" 
              />
            </div>
          </motion.div>
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="col-span-12 md:col-start-9 md:col-span-4 mt-16 md:mt-0"
          >
            <h3 className="font-bodoni text-headline-lg text-primary mb-6">The Soul of Ghana</h3>
            <div className="w-12 h-[1px] bg-secondary mb-8"></div>
            <p className="font-hanken text-body-lg text-on-surface-variant mb-8 leading-relaxed">
              IKEBEE is a dialogue between the echoes of our ancestors and the rhythm of tomorrow. Every stitch is a story, every pattern a proverb. We curate the finest Ghanaian textiles and reinterpret them for the global stage—a celebration of lineage, craft, and the enduring power of heritage.
            </p>
            <Link to="/heritage" className="font-hanken text-label-sm text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-all">OUR HERITAGE STORY</Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="bg-surface-container-low py-section-gap">
        <div className="px-margin-edge max-w-container-max mx-auto mb-12 flex justify-between items-end">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="font-hanken text-label-sm text-secondary uppercase tracking-widest">Curated Selects</span>
            <h2 className="font-bodoni text-headline-lg text-primary">Featured Collections</h2>
          </motion.div>
          <div className="hidden md:flex gap-4">
            <button className="w-12 h-12 border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all duration-300">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button className="w-12 h-12 border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all duration-300">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-gutter px-margin-edge pb-12">
          {/* Collection Cards */}
          {[
            {
              title: "The Golden Stool",
              category: "READY-TO-WEAR • FW24",
              tag: "LIMITED EDITION",
              img: "/heritage_1.png"
            },
            {
              title: "Obsidian Nights",
              category: "BESPOKE • TAILORED",
              img: "/lookbook_2.png"
            },
            {
              title: "Modern Batakari",
              category: "UNISEX • CAPSULE",
              img: "/lookbook_3.png"
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="min-w-[320px] md:min-w-[450px] group cursor-pointer"
            >
              <div className="aspect-[3/4] overflow-hidden mb-6 relative">
                <img 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  src={item.img} 
                />
                {item.tag && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-background px-3 py-1 font-hanken text-[10px] text-secondary border border-secondary">{item.tag}</span>
                  </div>
                )}
              </div>
              <h4 className="font-bodoni text-headline-md text-primary mb-2">{item.title}</h4>
              <p className="font-hanken text-label-sm text-on-surface-variant uppercase tracking-widest">{item.category}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-section-gap px-margin-edge max-w-container-max mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h3 className="font-bodoni text-headline-lg text-primary mb-4 italic">Join the Inner Circle</h3>
          <p className="font-hanken text-body-md text-on-surface-variant mb-12">Receive exclusive access to new collections, heritage narratives, and bespoke invitations.</p>
          {subscribed ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center">
              <p className="font-bodoni text-headline-md text-secondary italic">Welcome to the Inner Circle.</p>
              <p className="font-hanken text-label-sm text-on-surface-variant mt-2 uppercase tracking-widest">You'll hear from us soon.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col md:flex-row gap-gutter">
              <div className="flex-grow">
                <label className="block text-left font-hanken text-label-sm text-primary mb-2 uppercase">Email Address</label>
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border-0 border-b border-primary px-0 py-3 focus:ring-0 focus:border-secondary transition-colors font-hanken text-body-md" 
                  placeholder="YOUR@EMAIL.COM" 
                  type="email" 
                />
              </div>
              <button disabled={loading} className="mt-4 md:mt-8 px-10 py-3 bg-primary text-white font-hanken text-label-sm hover:bg-secondary transition-colors disabled:opacity-50" type="submit">
                {loading ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
              </button>
            </form>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
