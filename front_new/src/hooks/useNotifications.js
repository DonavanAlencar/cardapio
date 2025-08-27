import { useEffect, useState, useCallback } from 'react';
import { fetchNotifications, fetchNotificationsMeta } from '../services/notifications';

export default function useNotifications(initialParams = {}) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ types: [], colors: [], statuses: [] });

  const load = useCallback(async (params = initialParams) => {
    try {
      setLoading(true);
      const data = await fetchNotifications(params);
      setItems(data.items || []);
      setCount(data.count || 0);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    (async () => {
      try {
        const m = await fetchNotificationsMeta();
        setMeta(m);
      } catch (e) {
        // meta é opcional; não bloquear fluxo
      }
    })();
    load();
    const id = setInterval(() => load(), 30000);
    return () => clearInterval(id);
  }, [load]);

  return { items, count, loading, error, meta, reload: load };
}


