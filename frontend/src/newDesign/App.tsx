import React, { useState } from "react";
import { AppProvider, useApp } from "../../components/AppContext";
import { Sidebar } from "../../components/Sidebar";
import { LoginScreen } from "../../components/LoginScreen";
import { Dashboard } from "../../components/Dashboard";
import { TablesManagement } from "../../components/TablesManagement";
import { OrdersManagement } from "../../components/OrdersManagement";
import { KitchenPanel } from "../../components/KitchenPanel";
import { StockManagement } from "../../components/StockManagement";
import { ProductsManagement } from "../../components/ProductsManagement";
import { CategoriesManagement } from "../../components/CategoriesManagement";
import { IngredientsManagement } from "../../components/IngredientsManagement";
import { StockMovementManagement } from "../../components/StockMovementManagement";
import { Button } from "../../components/ui/button";
import { Menu, Bell } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Toaster } from "../../components/ui/sonner";

// NOTE: This file contains a preliminary integration of the new Figma based design.
// It is not wired into the build and serves as a starting point for future work.

function AppContent() {
  const { currentPage, user, orders, stockItems } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || currentPage === "login") {
    return <LoginScreen />;
  }

  const activeOrdersCount = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "preparing" ||
      order.status === "ready",
  ).length;

  const lowStockCount = stockItems.filter(
    (item) => item.quantity <= item.minQuantity,
  ).length;

  const totalNotifications = activeOrdersCount + lowStockCount;

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "tables":
        return <TablesManagement />;
      case "orders":
        return <OrdersManagement />;
      case "kitchen":
        return <KitchenPanel />;
      case "products":
        return <ProductsManagement />;
      case "categories":
        return <CategoriesManagement />;
      case "ingredients":
        return <IngredientsManagement />;
      case "stock-movement":
        return <StockMovementManagement />;
      case "stock":
        return <StockManagement />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard";
      case "tables":
        return "Mesas";
      case "orders":
        return "Pedidos (Admin)";
      case "kitchen":
        return "Cozinha";
      case "products":
        return "Produtos";
      case "categories":
        return "Categorias";
      case "ingredients":
        return "Ingredientes";
      case "stock-movement":
        return "Movimentação de Estoque";
      case "stock":
        return "Estoque";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-80">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {getPageTitle()}
                </span>{" "}• {user.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {totalNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {totalNotifications > 9 ? "9+" : totalNotifications}
                </Badge>
              )}
            </Button>
          </div>
        </header>
        <main className="p-4 lg:p-6">{renderPage()}</main>
      </div>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
