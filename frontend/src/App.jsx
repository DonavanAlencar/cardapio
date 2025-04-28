import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminGarcons from './pages/AdminGarcons';
import AdminMesas from './pages/AdminMesas';
import AdminProdutos from './pages/AdminProdutos';
import AdminComissao from './pages/AdminComissao';
import GarcomMesas from './pages/GarcomMesas';
import GarcomPedido from './pages/GarcomPedido';
import GarcomComissao from './pages/GarcomComissao';
import Cardapio from './pages/Cardapio';
import api from './services/api';
import jwt_decode from 'jwt-decode';

function App() {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  const PrivateRoute = ({ children, role }) => {
    if (!token) return <Navigate to="/login" />;
    const user = jwt_decode(token);
    if (role && user.role !== role) return <Navigate to="/login" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/garcons" element={<PrivateRoute role="admin"><AdminGarcons /></PrivateRoute>} />
        <Route path="/admin/mesas" element={<PrivateRoute role="admin"><AdminMesas /></PrivateRoute>} />
        <Route path="/admin/produtos" element={<PrivateRoute role="admin"><AdminProdutos /></PrivateRoute>} />
        <Route path="/admin/comissao" element={<PrivateRoute role="admin"><AdminComissao /></PrivateRoute>} />
        <Route path="/garcom/mesas" element={<PrivateRoute role="waiter"><GarcomMesas /></PrivateRoute>} />
        <Route path="/garcom/pedido/:pedidoId?" element={<PrivateRoute role="waiter"><GarcomPedido /></PrivateRoute>} />
        <Route path="/garcom/comissao" element={<PrivateRoute role="waiter"><GarcomComissao /></PrivateRoute>} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;