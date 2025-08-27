import api from './api';

export async function fetchNotifications(params = {}) {
  const { data } = await api.get('/notifications', { params, __silent: true });
  return data;
}

export async function fetchNotificationsMeta() {
  const { data } = await api.get('/notifications/meta', { __silent: true });
  return data;
}

export function groupByType(items = []) {
  return items.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {});
}


