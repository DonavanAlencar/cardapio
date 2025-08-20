import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import Layout from '../components/Layout/Layout';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Kitchen from '../pages/Kitchen/Kitchen';
import Menu from '../pages/Menu/Menu';
import Orders from '../pages/Orders/Orders';
import Stock from '../pages/Stock/Stock';
import Categories from '../pages/Categories/Categories';
import Ingredients from '../pages/Ingredients/Ingredients';

// Importar novas páginas administrativas
import AdminGarcons from '../pages/Admin/AdminGarcons';
import AdminMesas from '../pages/Admin/AdminMesas';
import AdminProdutos from '../pages/Admin/AdminProdutos';
import AdminComissao from '../pages/Admin/AdminComissao';
import AdminProductCategories from '../pages/Admin/AdminProductCategories';
import AdminProductModifiers from '../pages/Admin/AdminProductModifiers';
import AdminReports from '../pages/Admin/AdminReports';
import AdminStockMovements from '../pages/Admin/AdminStockMovements';
import AdminPedidos from '../pages/Admin/AdminPedidos';

// Importar páginas do garçom
import GarcomMesas from '../pages/Garcom/GarcomMesas';
import GarcomPedido from '../pages/Garcom/GarcomPedido';
import GarcomComissao from '../pages/Garcom/GarcomComissao';

// Importar páginas públicas
import Cardapio from '../pages/Public/Cardapio';

// Componente para rotas privadas
const PrivateRoute = ({ children, role, roles }) => {
  const currentToken = localStorage.getItem('token');
  if (!currentToken) return <Navigate to="/login" />;
  
  try {
    const user = jwt_decode(currentToken);
    if (role && user.role !== role) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
    return children;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
};

export default function RoutesIndex() {
  const { pathname } = useLocation();
  const lowerPath = pathname.toLowerCase();
  if (pathname !== lowerPath) {
    return <Navigate to={lowerPath} replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cardapio" element={<Cardapio />} />
      
      <Route element={<Layout />}> 
        <Route index element={<Dashboard />} />
        
        {/* Rotas Administrativas */}
        <Route path="admin/garcons" element={<PrivateRoute role="admin"><AdminGarcons /></PrivateRoute>} />
        <Route path="admin/mesas" element={<PrivateRoute role="admin"><AdminMesas /></PrivateRoute>} />
        <Route path="admin/produtos" element={<PrivateRoute role="admin"><AdminProdutos /></PrivateRoute>} />
        <Route path="admin/comissao" element={<PrivateRoute role="admin"><AdminComissao /></PrivateRoute>} />
        <Route path="admin/product-categories" element={<PrivateRoute role="admin"><AdminProductCategories /></PrivateRoute>} />
        <Route path="admin/product-modifiers" element={<PrivateRoute role="admin"><AdminProductModifiers /></PrivateRoute>} />
        <Route path="admin/reports" element={<PrivateRoute role="admin"><AdminReports /></PrivateRoute>} />
        <Route path="admin/stock-movements" element={<PrivateRoute role="admin"><AdminStockMovements /></PrivateRoute>} />
        <Route path="admin/ingredients" element={<PrivateRoute role="admin"><AdminIngredients /></PrivateRoute>} />
        <Route path="admin/pedidos" element={<PrivateRoute role="admin"><AdminPedidos /></PrivateRoute>} />
        
        {/* Rotas do Garçom */}
        <Route path="garcom/mesas" element={<PrivateRoute role="waiter"><GarcomMesas /></PrivateRoute>} />
        <Route path="garcom/pedido/:pedidoId?" element={<PrivateRoute role="waiter"><GarcomPedido /></PrivateRoute>} />
        <Route path="garcom/comissao" element={<PrivateRoute role="waiter"><GarcomComissao /></PrivateRoute>} />
        
        {/* Rotas da Cozinha */}
        <Route path="cozinha" element={<PrivateRoute roles={['admin','cozinha']}><Kitchen /></PrivateRoute>} />
        
        {/* Rotas Gerais */}
        <Route path="kitchen" element={<Kitchen />} />
        <Route path="menu" element={<Menu />} />
        <Route path="orders" element={<Orders />} />
        <Route path="stock" element={<Stock />} />
        <Route path="categories" element={<Categories />} />
        <Route path="ingredients" element={<Ingredients />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
