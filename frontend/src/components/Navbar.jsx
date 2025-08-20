import React from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 inset-x-0 h-16 bg-slate-900 text-white z-50 shadow-md">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="font-semibold tracking-tight">Cardápio</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition">Ajuda</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
