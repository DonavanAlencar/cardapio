import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useEffect } from 'react';
import api from '../services/api';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [pedidoForm, setPedidoForm] = useState({ customer_id: '', table_id: '', waiter_session_id: '' });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchPedidos = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        const response = await api.get('/api/orders');
        setPedidos(response.data);
        setError(null); // Limpa erros anteriores
        setLastUpdate(new Date());
      } catch (err) {
        setError(err);
        console.error('Erro ao buscar pedidos:', err);
        console.error('Detalhes do erro:', err.response?.data);
        console.error('Status do erro:', err.response?.status);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    // Primeira carga com loading
    fetchPedidos(true);
    
    // Atualizações automáticas sem loading (a cada 10 segundos)
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => fetchPedidos(false), 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

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
  if (!pedidos.length) {
    console.log('Nenhum pedido encontrado. Estado pedidos:', pedidos);
    return <p>Nenhum pedido encontrado.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Pedidos</h1>

      <div className="mb-8 p-4 border rounded shadow-sm flex justify-between items-center">
        <Button variant="contained" color="primary" onClick={openAddModal}>
          Adicionar Pedido
        </Button>
        <div className="flex items-center gap-4">
          <Button 
            variant="outlined" 
            onClick={() => fetchPedidos(false)}
            disabled={loading}
          >
            Atualizar
          </Button>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            Auto-atualizar
          </label>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
          )}
        </div>
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Mesa
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pedido.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pedido.customer_id || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pedido.table_id || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {parseFloat(pedido.total_amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    pedido.status === 'closed' ? 'bg-green-100 text-green-800' :
                    pedido.status === 'open' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pedido.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(pedido.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openEditModal(pedido)}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPedidos; 