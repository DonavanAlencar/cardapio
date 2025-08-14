import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav
      className="p-4 fixed w-full z-10 top-0 shadow-md"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-foreground)'
      }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold"></div>
        <ul className="flex space-x-4">
          <li>
            <button
              className="font-bold py-2 px-4 rounded"
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-secondary-foreground)'
              }}
            >
              Help
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;