import { useEffect, useState, useCallback } from 'react';
import { fetchNotifications, fetchNotificationsMeta } from '../services/notifications';

export default function useNotifications(initialParams = {}) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ types: [], colors: [], statuses: [] });
  const [disabled, setDisabled] = useState(false);

  const load = useCallback(async (params = initialParams) => {
    if (disabled) return;
    try {
      setLoading(true);
      const data = await fetchNotifications(params);
      setItems(data.items || []);
      setCount(data.count || 0);
      setError(null);
    } catch (err) {
      setError(err);
      const status = err?.response?.status;
      const isNetwork = err?.code === 'ERR_NETWORK' || err?.message === 'Network Error';
      if (status === 404 || status === 401 || isNetwork) {
        // Desabilita novas tentativas para evitar loop e consumo de recursos
        setDisabled(true);
        setItems([]);
        setCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [initialParams, disabled]);

  useEffect(() => {
    (async () => {
      try {
        const m = await fetchNotificationsMeta();
        setMeta(m);
      } catch (e) {
        // meta opcional; se 404/401 ou erro de rede, não tentar novamente e desabilita
        const status = e?.response?.status;
        const isNetwork = e?.code === 'ERR_NETWORK' || e?.message === 'Network Error';
        if (status === 404 || status === 401 || isNetwork) {
          setDisabled(true);
        }
      }
    })();
    load();
    let id;
    if (!disabled) {
      id = setInterval(() => load(), 30000);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [load, disabled]);

  return { items, count, loading, error, meta, reload: load, disabled };
}


