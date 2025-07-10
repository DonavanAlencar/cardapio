import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300">Terms of Service</a>
          <a href="#" className="hover:text-gray-300">Sitemap</a>
        </div>
        <div className="flex justify-center space-x-4 mb-4">
          {/* Social Icons Placeholder */}
          <a href="#" className="text-white hover:text-gray-300"><i className="fab fa-facebook-f"></i></a>
          <a href="#" className="text-white hover:text-gray-300"><i className="fab fa-twitter"></i></a>
          <a href="#" className="text-white hover:text-gray-300"><i className="fab fa-instagram"></i></a>
        </div>
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;