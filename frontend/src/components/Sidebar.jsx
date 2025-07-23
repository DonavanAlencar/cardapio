import React, { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Assessment,
  Store,
  Category,
  ShoppingCart,
  LocalOffer,
  EventNote,
  RestaurantMenu,
  Group,
  Kitchen,
  ListAlt,
  ArrowBack,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  AccountCircle,
  Logout,
  Edit,
} from "@mui/icons-material";
import jwt_decode from "jwt-decode";
import "./Sidebar.css";

const fullMenu = [
  { label: "Cardápio", icon: <RestaurantMenu />, path: "/cardapio", roles: ["admin", "waiter"] },
  { label: "Mesas", icon: <Store />, path: "/garcom/mesas", roles: ["waiter"] },
  { label: "Pedidos", icon: <ShoppingCart />, path: "/garcom/pedido", roles: ["waiter"] },
  { label: "Comissão", icon: <Assessment />, path: "/garcom/comissao", roles: ["waiter"] },
  { label: "Cozinha", icon: <Kitchen />, path: "/cozinha", roles: ["admin", "cozinha"] },
  {
    label: "Administração",
    icon: <ListAlt />,
    roles: ["admin"],
    children: [
      { label: "Mesas", icon: <Store />, path: "/admin/mesas", roles: ["admin"] },
      { label: "Pedidos (Admin)", icon: <ShoppingCart />, path: "/admin/pedidos", roles: ["admin"] },
      { label: "Produtos", icon: <ShoppingCart />, path: "/admin/produtos", roles: ["admin"] },
      { label: "Categorias de Produtos", icon: <Category />, path: "/admin/product-categories", roles: ["admin"] },
      { label: "Modificadores de Produtos", icon: <LocalOffer />, path: "/admin/product-modifiers", roles: ["admin"] },
      { label: "Ingredientes", icon: <Kitchen />, path: "/admin/ingredients", roles: ["admin"] },
      { label: "Relatórios", icon: <Assessment />, path: "/admin/reports", roles: ["admin"] },
      { label: "Movimentação de Estoque", icon: <EventNote />, path: "/admin/stock-movements", roles: ["admin"] },
      { label: "Configuração de Comissão", icon: <Assessment />, path: "/admin/comissao", roles: ["admin"] },
      { label: "Garçons", icon: <Group />, path: "/admin/garcons", roles: ["admin"] },
    ]
  },
];

function getUserInfo() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const user = jwt_decode(token);
    return user;
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const [open, setOpen] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useMemo(getUserInfo, []);
  const role = user?.role;

  const menu = useMemo(() =>
    fullMenu.filter(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(child => child.roles.includes(role));
        return filteredChildren.length > 0;
      }
      return item.roles.includes(role);
    }).map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => child.roles.includes(role))
        };
      }
      return item;
    })
  , [role]);

  const handleToggle = (label) => {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}> 
      <div className="sidebar-profile flex items-center gap-2 p-4 relative">
        <div
          className="sidebar-avatar cursor-pointer flex items-center gap-2"
          onClick={() => setProfileMenu((v) => !v)}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
              {user?.name ? user.name[0].toUpperCase() : <AccountCircle fontSize="large" />}
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{user?.name || 'Usuário'}</span>
              <span className="text-xs text-gray-500">{user?.email || ''}</span>
            </div>
          )}
        </div>
        {profileMenu && !collapsed && (
          <div className="sidebar-profile-menu absolute left-16 top-12 bg-white shadow-lg rounded z-50 min-w-[140px] border">
            <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100" onClick={() => { setProfileMenu(false); navigate('/editar-perfil'); }}>
              <Edit fontSize="small" /> Editar perfil
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100" onClick={handleLogout}>
              <Logout fontSize="small" /> Sair
            </button>
          </div>
        )}
      </div>
      <div className="sidebar-logo flex items-center justify-between pr-2">
        <span style={{ transition: 'opacity 0.2s', opacity: collapsed ? 0 : 1 }}>{collapsed ? '' : 'Cardápio'}</span>
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
      <ul className="sidebar-menu">
        {menu.map((item) =>
          item.children ? (
            <li key={item.label}>
              <div
                className={`sidebar-item ${open[item.label] ? "open" : ""}`}
                onClick={() => handleToggle(item.label)}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && (open[item.label] ? <ExpandLess /> : <ExpandMore />)}
              </div>
              {open[item.label] && !collapsed && (
                <ul className="sidebar-submenu">
                  {item.children.map((sub) => (
                    <li key={sub.label}>
                      <Link
                        to={sub.path}
                        className={location.pathname === sub.path ? "active" : ""}
                      >
                        {sub.icon}
                        <span>{sub.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ) : (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          )
        )}
      </ul>
      <div className="sidebar-footer">
        {!collapsed && <button className="sidebar-lang">PT</button>}
        <button className="sidebar-logout">
          <ArrowBack /> {!collapsed && 'Sair'}
        </button>
      </div>
    </div>
  );
} 