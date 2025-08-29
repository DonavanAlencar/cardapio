import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminGarcons from './pages/AdminGarcons';
import AdminMesas from './pages/AdminMesas';
import AdminProdutos from './pages/AdminProdutos';
import AdminComissao from './pages/AdminComissao';
import AdminProductCategories from './pages/AdminProductCategories';
import AdminProductModifiers from './pages/AdminProductModifiers';
import AdminReports from './pages/AdminReports';
import AdminStockMovements from './pages/AdminStockMovements';
import AdminIngredients from './pages/AdminIngredients';

import Cardapio from './pages/Cardapio';
import Cozinha from './pages/Cozinha';
import AdminPedidos from './pages/AdminPedidos';
import api from './services/api';
import jwt_decode from 'jwt-decode';

import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import Gallery from './components/Gallery';
import ContactForm from './components/ContactForm';
import Extras from './components/Extras';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);
  const PrivateRoute = ({ children, role, roles }) => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return <Navigate to="/login" />;
    const user = jwt_decode(currentToken);
    if (role && user.role !== role) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
    return children;
  };

  const NewFeaturesPage = () => (
    <>
      <Navbar />
      <Hero />
      <FeatureGrid />
      <Gallery />
      <ContactForm />
      <Extras />
    </>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/admin/garcons" element={<PrivateRoute role="admin"><AdminGarcons /></PrivateRoute>} />
          <Route path="/admin/mesas" element={<PrivateRoute role="admin"><AdminMesas /></PrivateRoute>} />
          <Route path="/admin/produtos" element={<PrivateRoute role="admin"><AdminProdutos /></PrivateRoute>} />
          <Route path="/admin/comissao" element={<PrivateRoute role="admin"><AdminComissao /></PrivateRoute>} />
          <Route path="/admin/product-categories" element={<PrivateRoute role="admin"><AdminProductCategories /></PrivateRoute>} />
          <Route path="/admin/product-modifiers" element={<PrivateRoute role="admin"><AdminProductModifiers /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute role="admin"><AdminReports /></PrivateRoute>} />
          <Route path="/admin/stock-movements" element={<PrivateRoute role="admin"><AdminStockMovements /></PrivateRoute>} />
          <Route path="/admin/ingredients" element={<PrivateRoute role="admin"><AdminIngredients /></PrivateRoute>} />
          <Route path="/admin/pedidos" element={<PrivateRoute role="admin"><AdminPedidos /></PrivateRoute>} />

          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/cozinha" element={<PrivateRoute roles={['admin','cozinha']}><Cozinha /></PrivateRoute>} />
          <Route path="/new-features" element={<NewFeaturesPage />} /> {/* New route for showcasing components */}
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;