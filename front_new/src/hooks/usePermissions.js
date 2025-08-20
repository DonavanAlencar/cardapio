import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user, hasRole, hasAnyRole, canAccess } = useAuth();

  const isAdmin = () => hasRole('admin');
  const isWaiter = () => hasRole('waiter');
  const isKitchen = () => hasRole('cozinha');
  
  const canManageUsers = () => hasRole('admin');
  const canManageProducts = () => hasAnyRole(['admin', 'cozinha']);
  const canManageOrders = () => hasAnyRole(['admin', 'waiter', 'cozinha']);
  const canViewReports = () => hasRole('admin');
  const canManageStock = () => hasAnyRole(['admin', 'cozinha']);
  
  const hasPermission = (permission) => {
    const permissions = {
      'users.manage': canManageUsers,
      'products.manage': canManageProducts,
      'orders.manage': canManageOrders,
      'reports.view': canViewReports,
      'stock.manage': canManageStock,
    };
    
    return permissions[permission] ? permissions[permission]() : false;
  };

  return {
    user,
    isAdmin,
    isWaiter,
    isKitchen,
    canManageUsers,
    canManageProducts,
    canManageOrders,
    canViewReports,
    canManageStock,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess
  };
};
