import React from 'react';

const Extras = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="italic text-gray-700 mb-4">"This product changed my life! Highly recommend to everyone."</p>
            <p className="font-semibold text-right">- Jane Doe</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="italic text-gray-700 mb-4">"Amazing service and incredible results. Will definitely use again."</p>
            <p className="font-semibold text-right">- John Smith</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Extras;