import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import './Sidebar.css';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="flex pt-16">
        <aside className="shrink-0">
          <Sidebar />
        </aside>
        <main className="flex-1 min-h-[calc(100vh-64px-64px)] p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
