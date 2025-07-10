import React from 'react';
import { motion } from 'framer-motion';

const features = [
  { title: 'Feature One', description: 'Brief description of feature one.' },
  { title: 'Feature Two', description: 'Brief description of feature two.' },
  { title: 'Feature Three', description: 'Brief description of feature three.' },
  { title: 'Feature Four', description: 'Brief description of feature four.' },
];

const FeatureCard = ({ title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-6 rounded-lg shadow-lg text-center"
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const FeatureGrid = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;