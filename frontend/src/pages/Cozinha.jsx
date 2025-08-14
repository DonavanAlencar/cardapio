import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const statusOrder = ['pending', 'preparing', 'done', 'served'];
const statusLabels = {
  pending: 'Pendente',
  preparing: 'Em Preparo',
  done: 'Pronto',
  served: 'Entregue',
};

export default function Cozinha() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kitchen/tickets');
      setTickets(res.data);
    } catch (err) {
      setTickets([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (ticketId, itemId, currentStatus) => {
    const idx = statusOrder.indexOf(currentStatus);
    if (idx === -1 || idx === statusOrder.length - 1) return;
    const nextStatus = statusOrder[idx + 1];
    await api.put(`/kitchen/tickets/${ticketId}/items/${itemId}/status`, {
      preparation_status: nextStatus,
    });
    fetchTickets();
  };

  // Agrupar por status
  const grouped = {};
  tickets.forEach(t => {
    if (!grouped[t.preparation_status]) grouped[t.preparation_status] = [];
    grouped[t.preparation_status].push(t);
  });

  return (
    <Box className="p-4">
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Painel da Cozinha
      </Typography>
      {loading && <div>Carregando...</div>}
      {!loading && statusOrder.map(status => (
        <div key={status} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{statusLabels[status]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(grouped[status] || []).map(item => (
              <div key={item.ticket_item_id} className="border p-4 rounded shadow">
                <div><b>Pedido:</b> {item.order_id}</div>
                <div><b>Produto:</b> {item.product_name}</div>
                <div><b>Qtd:</b> {item.quantity}</div>
                <div><b>Status:</b> {statusLabels[item.preparation_status]}</div>
                {status !== 'served' && (
                  <Button onClick={() => handleAdvanceStatus(item.ticket_id, item.ticket_item_id, item.preparation_status)} color="primary" variant="contained" className="mt-2">
                    Avançar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </Box>
  );
}