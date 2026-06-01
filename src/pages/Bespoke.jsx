import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sendBespokeRequest } from '../services/api';
import SEO from '../components/SEO';

const JourneyStep = ({ number, title, description, image, index }) => {
  const isEven = index % 2 === 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: index * 0.2 }}
      className={`flex flex-col md:flex-row gap-gutter mb-24 items-center ${isEven ? '' : 'md:flex-row-reverse'}`}
    >
      <div className="w-full md:w-1/2 aspect-video overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
      </div>
      <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-16' : 'md:pr-16'}`}>
        <span className="font-bodoni text-display-md text-secondary/30 mb-4 block">{number}</span>
        <h3 className="font-bodoni text-headline-lg text-primary mb-6">{title}</h3>
        <p className="font-hanken text-body-md text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const Bespoke = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', service: '', story: '' });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setLoading(true);
      try {
        await sendBespokeRequest(formData);
        setSubmitted(true);
      } catch (error) {
        console.error("Submission failed", error);
      } finally {
        setLoading(false);
      }
    }
  };
  const steps = [
    {
      number: "01",
      title: "The Initial Consultation",
      description: "A private dialogue to explore your personal heritage, silhouette preferences, and the specific occasion. We listen to the story you wish to tell through your garment.",
      image: "/lookbook_header.png"
    },
    {
      number: "02",
      title: "Material Curation",
      description: "Access our private archive of hand-woven Kente, vintage silks, and ethically sourced northern batiks. We select patterns that resonate with your lineage.",
      image: "/lookbook_2.png"
    },
    {
      number: "03",
      title: "Master Creation",
      description: "Your garment is brought to life by our master tailors in Accra. Every stitch is a commitment to quality, blending ancestral techniques with contemporary precision.",
      image: "/heritage_1.png"
    }
  ];

  return (
    <div className="bg-background pt-32 overflow-hidden">
      <SEO title="Bespoke Tailoring" description="Experience IKEBEE's Bespoke service. A private dialogue to create your personal heritage garment." />
      {/* Hero Section */}
      <section className="px-margin-edge max-w-container-max mx-auto mb-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-6">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-hanken text-label-sm text-secondary uppercase tracking-[0.5em] mb-6 block"
            >
              The Private Atelier
            </motion.span>
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-bodoni text-display-xl text-primary mb-8 leading-none"
            >
              A Heritage <br/>Made To Measure
            </motion.h1>
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-hanken text-body-lg text-on-surface-variant max-w-md mb-12"
            >
              Our Bespoke service is more than tailoring—it is the ultimate expression of Modern Ancestry. We collaborate with you to create a one-of-a-kind masterpiece that honors your individual journey.
            </motion.p>
          </div>
          <div className="md:col-span-6 relative">
             <div className="aspect-[4/5] overflow-hidden">
                <img src="/lookbook_1.png" alt="Bespoke Suit" className="w-full h-full object-cover" />
             </div>
             <div className="absolute -bottom-12 -right-12 w-48 h-48 border-[0.5px] border-secondary -z-10"></div>
          </div>
        </div>
      </section>

      {/* The Journey Section */}
      <section className="py-section-gap px-margin-edge max-w-container-max mx-auto border-t border-primary/5">
        <div className="text-center mb-24">
          <h2 className="font-bodoni text-headline-lg text-primary italic">The Journey of Creation</h2>
          <div className="w-12 h-[1px] bg-secondary mx-auto mt-6"></div>
        </div>
        
        <div>
          {steps.map((step, index) => (
            <JourneyStep key={index} {...step} index={index} />
          ))}
        </div>
      </section>

      {/* Concierge Form Section */}
      <section className="bg-primary py-32 text-on-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 -skew-x-12 translate-x-1/2"></div>
        
        <div className="px-margin-edge max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center relative z-10">
          <div>
            <h2 className="font-bodoni text-display-md mb-8 italic">Begin Your <br/>Legacy Today</h2>
            <p className="font-hanken text-body-md text-on-primary/60 mb-12 max-w-sm">
              Our concierge team is available for virtual or in-person consultations in Accra, London, and New York.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary">location_on</span>
                <span className="font-hanken text-label-sm tracking-widest">Global Concierge</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary">mail</span>
                <span className="font-hanken text-label-sm tracking-widest">concierge@ikebee.com</span>
              </div>
            </div>
          </div>
          
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-12 shadow-2xl text-center"
            >
              <span className="material-symbols-outlined text-secondary text-5xl mb-4 block">check_circle</span>
              <h4 className="font-bodoni text-headline-sm text-primary mb-4 italic">Request Received</h4>
              <p className="font-hanken text-body-md text-on-surface-variant">
                Our concierge team will be in touch within 48 hours to begin your bespoke journey.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-12 shadow-2xl">
              <h4 className="font-bodoni text-headline-sm text-primary mb-8 uppercase tracking-widest text-center">Consultation Request</h4>
              <div className="space-y-8">
                <div className="border-b border-primary/10 pb-2">
                  <input name="name" value={formData.name} onChange={handleChange} required type="text" placeholder="FULL NAME" className="w-full bg-transparent font-hanken text-[10px] tracking-widest outline-none text-primary placeholder:text-primary/30" />
                </div>
                <div className="border-b border-primary/10 pb-2">
                  <input name="email" value={formData.email} onChange={handleChange} required type="email" placeholder="EMAIL ADDRESS" className="w-full bg-transparent font-hanken text-[10px] tracking-widest outline-none text-primary placeholder:text-primary/30" />
                </div>
                <div className="border-b border-primary/10 pb-2">
                  <select name="service" value={formData.service} onChange={handleChange} className="w-full bg-transparent font-hanken text-[10px] tracking-widest outline-none text-primary appearance-none">
                    <option value="">SELECT SERVICE</option>
                    <option>BESPOKE TAILORING</option>
                    <option>PRIVATE CURATION</option>
                    <option>BRIDAL HERITAGE</option>
                  </select>
                </div>
                <div className="border-b border-primary/10 pb-2">
                  <textarea name="story" value={formData.story} onChange={handleChange} placeholder="TELL US YOUR STORY" rows="3" className="w-full bg-transparent font-hanken text-[10px] tracking-widest outline-none text-primary placeholder:text-primary/30 resize-none"></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full py-5 bg-primary text-white font-hanken text-label-sm tracking-[0.3em] hover:bg-secondary transition-colors duration-500 disabled:opacity-50">
                  {loading ? 'SENDING...' : 'SEND REQUEST'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Bespoke;
