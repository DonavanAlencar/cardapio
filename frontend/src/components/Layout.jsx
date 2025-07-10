import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 pt-16"> {/* pt-16 para compensar o navbar fixo */}
        <Sidebar />
        <main className="flex-grow p-6 bg-gray-50 min-h-[calc(100vh-64px-64px)]"> {/* Ajuste para espaçamento e cor de fundo */}
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;