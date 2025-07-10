import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "@mui/icons-material";
import jwt_decode from "jwt-decode";
import "./Sidebar.css";

const fullMenu = [
  // Menu público
  { label: "Cardápio", icon: <RestaurantMenu />, path: "/cardapio", roles: ["admin", "waiter"] },

  // Menus do garçom
  { label: "Mesas", icon: <Store />, path: "/garcom/mesas", roles: ["waiter"] },
  { label: "Pedidos", icon: <ShoppingCart />, path: "/garcom/pedido", roles: ["waiter"] },
  { label: "Comissão", icon: <Assessment />, path: "/garcom/comissao", roles: ["waiter"] },

  // Menus do admin agrupados
  {
    label: "Administração",
    icon: <ListAlt />,
    roles: ["admin"],
    children: [
      { label: "Mesas", icon: <Store />, path: "/admin/mesas", roles: ["admin"] },
      { label: "Produtos", icon: <ShoppingCart />, path: "/admin/produtos", roles: ["admin"] },
      { label: "Categorias de Produtos", icon: <Category />, path: "/admin/product-categories", roles: ["admin"] },
      { label: "Modificadores de Produtos", icon: <LocalOffer />, path: "/admin/product-modifiers", roles: ["admin"] },
      { label: "Ingredientes", icon: <Kitchen />, path: "/admin/ingredients", roles: ["admin"] },
      { label: "Relatórios", icon: <Assessment />, path: "/admin/reports", roles: ["admin"] },
      { label: "Movimentação de Estoque", icon: <EventNote />, path: "/admin/stock-movements", roles: ["admin"] },
      { label: "Comissão", icon: <Assessment />, path: "/admin/comissao", roles: ["admin"] },
      { label: "Garçons", icon: <Group />, path: "/admin/garcons", roles: ["admin"] },
    ]
  },
];

function getUserRole() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const user = jwt_decode(token);
    return user.role;
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const [open, setOpen] = useState({});
  const location = useLocation();
  const role = useMemo(getUserRole, []);

  // Filtra o menu conforme o papel do usuário
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

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span>Cardápio</span>
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
                <span>{item.label}</span>
                {open[item.label] ? <ExpandLess /> : <ExpandMore />}
              </div>
              {open[item.label] && (
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
                <span>{item.label}</span>
              </Link>
            </li>
          )
        )}
      </ul>
      <div className="sidebar-footer">
        <button className="sidebar-lang">PT</button>
        <button className="sidebar-logout">
          <ArrowBack /> Sair
        </button>
      </div>
    </div>
  );
} 