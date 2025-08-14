import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import Box from '@mui/material/Box';

const Layout = () => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbar />
      <Box display="flex" flex={1} pt={8}>
        <Sidebar />
        <Box component="main" flexGrow={1} p={3} bgcolor="grey.50" sx={{ minHeight: 'calc(100vh - 128px)' }}>
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;