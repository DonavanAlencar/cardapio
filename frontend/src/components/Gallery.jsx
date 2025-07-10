import React from 'react';
import { motion } from 'framer-motion';

const images = [
  'https://via.placeholder.com/300x200?text=Image+1',
  'https://via.placeholder.com/300x200?text=Image+2',
  'https://via.placeholder.com/300x200?text=Image+3',
  'https://via.placeholder.com/300x200?text=Image+4',
  'https://via.placeholder.com/300x200?text=Image+5',
  'https://via.placeholder.com/300x200?text=Image+6',
];

const Gallery = () => {
  // TODO: Integrate a lightbox library here. react-image-lightbox had compatibility issues with React 18.
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Our Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="overflow-hidden rounded-lg shadow-lg"
            >
              <img src={src} alt={`Gallery Image ${index + 1}`} className="w-full h-48 object-cover" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;