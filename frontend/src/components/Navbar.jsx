import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 text-white fixed w-full z-10 top-0">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold"></div>
        <ul className="flex space-x-4">
          <li><button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Help</button></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;