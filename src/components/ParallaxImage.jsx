import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxImage = ({ src, alt, className, ...props }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // By default, speed 0.5 means the image translates by 50% of its height
  // Negative Y means it moves UP slower than the scroll, creating depth
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        style={{ y, scale: 1.2 }} // scale up to prevent edges from showing
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        {...props}
      />
    </div>
  );
};

export default ParallaxImage;
