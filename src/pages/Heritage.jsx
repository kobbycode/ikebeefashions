import { motion } from 'framer-motion';

const Heritage = () => {
  return (
    <div className="bg-background pt-32 overflow-hidden">
      {/* Hero Section */}
      <section className="px-margin-edge max-w-container-max mx-auto mb-section-gap">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="font-hanken text-label-sm text-secondary uppercase tracking-[0.5em] mb-6 block">Our Story</span>
          <h1 className="font-bodoni text-display-xl text-primary mb-8 italic">The Soul of Ghana, <br/> Refined for the World.</h1>
          <p className="font-hanken text-body-lg text-on-surface-variant leading-relaxed">
            IKEBEE was born from a singular vision: to bridge the gap between the timeless wisdom of our ancestors and the dynamic pulse of contemporary luxury.
          </p>
        </motion.div>
      </section>

      {/* Image Spotlight - Artisan at Loom */}
      <section className="w-full relative h-[80vh] mb-section-gap overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 2 }}
          src="/heritage_1.png" 
          alt="Artisan Weaving" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-white"
          >
            <h2 className="font-bodoni text-headline-lg mb-4 italic">Hand-Woven Excellence</h2>
            <div className="w-16 h-[1px] bg-secondary mx-auto"></div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="px-margin-edge max-w-container-max mx-auto mb-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div>
            <h3 className="font-bodoni text-headline-lg text-primary mb-8">Modern Ancestry</h3>
            <p className="font-hanken text-body-md text-on-surface-variant mb-6 leading-relaxed">
              Every garment we create is a dialogue. We start with the textiles—the Kente of the Ashanti, the Batakari of the North, the hand-dyed silks of the coast. These are not just fabrics; they are archives of history.
            </p>
            <p className="font-hanken text-body-md text-on-surface-variant mb-8 leading-relaxed">
              We then layer these traditions with the precision of contemporary tailoring. The result is a silhouette that feels both ancient and futuristic—a tribute to where we come from and where we are going.
            </p>
            <div className="flex gap-12 pt-8 border-t border-primary/10">
              <div>
                <span className="block font-bodoni text-headline-md text-secondary mb-1">100%</span>
                <span className="font-hanken text-label-sm uppercase text-on-surface-variant">Ghanaian Sourced</span>
              </div>
              <div>
                <span className="block font-bodoni text-headline-md text-secondary mb-1">15+</span>
                <span className="font-hanken text-label-sm uppercase text-on-surface-variant">Master Artisans</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="aspect-[3/4] overflow-hidden"
            >
              <img 
                src="/lookbook_2.png" 
                alt="Textile Detail" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="absolute -top-12 -right-12 w-48 h-48 border-[0.5px] border-secondary -z-10 hidden md:block"></div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-32 bg-surface-container relative">
        <div className="px-margin-edge max-w-3xl mx-auto text-center italic">
          <span className="material-symbols-outlined text-secondary text-5xl mb-8">format_quote</span>
          <p className="font-bodoni text-headline-md text-primary mb-8 leading-tight">
            "Our clothes are built for the global citizen who carries their roots with pride. We don't just dress bodies; we honor lineages."
          </p>
          <span className="font-hanken text-label-sm text-secondary uppercase tracking-widest">— Founders of IKEBEE</span>
        </div>
      </section>

      {/* Sustainable Future */}
      <section className="py-section-gap px-margin-edge max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row gap-gutter items-center">
          <div className="w-full md:w-1/2">
             <div className="aspect-video overflow-hidden">
                <img 
                  src="/lookbook_3.png" 
                  alt="Minimalist Workshop" 
                  className="w-full h-full object-cover"
                />
             </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-16">
            <h3 className="font-bodoni text-headline-lg text-primary mb-6">A Sustainable Legacy</h3>
            <p className="font-hanken text-body-md text-on-surface-variant mb-8 leading-relaxed">
              Sustainability is not a trend at IKEBEE; it is our foundation. By working directly with local weaving communities, we ensure fair wages, preserve endangered crafts, and minimize our environmental footprint through small-batch production.
            </p>
            <a href="#" className="font-hanken text-label-sm text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-all">VIEW OUR SUSTAINABILITY REPORT</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Heritage;
