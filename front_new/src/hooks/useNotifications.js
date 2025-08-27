// Hook de notificações temporariamente desabilitado para evitar erros 404
// import { useEffect, useState, useCallback } from 'react';
// import { fetchNotifications, fetchNotificationsMeta } from '../services/notifications';

export default function useNotifications(initialParams = {}) {
  // Retorna dados mockados para evitar erros
  return { 
    items: [], 
    count: 0, 
    loading: false, 
    error: null, 
    meta: { types: [], colors: [], statuses: [] }, 
    reload: () => {}, 
    disabled: true 
  };
}


