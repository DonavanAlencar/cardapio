import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useEffect } from 'react';
import api from '../api';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [pedidoForm, setPedidoForm] = useState({ customer_id: '', table_id: '', waiter_session_id: '' });

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/orders');
        setPedidos(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const openAddModal = () => {
    setEditingPedido(null);
    setPedidoForm({ customer_id: '', table_id: '', waiter_session_id: '' });
    setModalOpen(true);
  };

  const openEditModal = (pedido) => {
    setEditingPedido(pedido);
    setPedidoForm({
      customer_id: pedido.customer_id || '',
      table_id: pedido.table_id || '',
      waiter_session_id: pedido.waiter_session_id || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handlePedidoFormChange = (e) => {
    const { name, value } = e.target;
    setPedidoForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPedido = async (e) => {
    e.preventDefault();
    if (editingPedido) {
      // Atualizar pedido (implementar se necessário)
    } else {
      // Adicionar novo pedido
      await api.post('/api/orders', pedidoForm);
    }
    closeModal();
    // Atualizar lista de pedidos (implementar fetchPedidos se necessário)
  };

  if (loading) return <p>Carregando pedidos...</p>;
  if (error) return <p>Erro ao carregar pedidos: {error.message}</p>;
  if (!pedidos.length) return <p>Nenhum pedido encontrado.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Pedidos</h1>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <Button variant="contained" color="primary" onClick={openAddModal}>
          Adicionar Pedido
        </Button>
      </div>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPedido ? 'Editar Pedido' : 'Adicionar Pedido'}</DialogTitle>
        <form onSubmit={handleSubmitPedido}>
          <DialogContent>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customer_id">Cliente:</label>
              <input
                type="text"
                id="customer_id"
                name="customer_id"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={pedidoForm.customer_id}
                onChange={handlePedidoFormChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="table_id">Mesa:</label>
              <input
                type="text"
                id="table_id"
                name="table_id"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={pedidoForm.table_id}
                onChange={handlePedidoFormChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="waiter_session_id">Sessão do Garçom:</label>
              <input
                type="text"
                id="waiter_session_id"
                name="waiter_session_id"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={pedidoForm.waiter_session_id}
                onChange={handlePedidoFormChange}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button type="submit" color="primary" variant="contained">
              {editingPedido ? 'Atualizar Pedido' : 'Adicionar Pedido'}
            </Button>
            <Button onClick={closeModal} color="secondary" variant="outlined">
              Cancelar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ...restante da tabela/lista de pedidos... */}
    </div>
  );
};

export default AdminPedidos; 