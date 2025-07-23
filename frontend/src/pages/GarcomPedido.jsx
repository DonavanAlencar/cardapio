import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function GarcomPedido() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [modifiers, setModifiers] = useState([]);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [kitchenStatus, setKitchenStatus] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchPaymentMethods();
    if (pedidoId) {
      fetchOrder(pedidoId);
      fetchKitchenStatus();
      const interval = setInterval(fetchKitchenStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [pedidoId]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError('Erro ao carregar produtos.');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/api/payment-methods');
      setPaymentMethods(response.data);
      if (response.data.length > 0) {
        setSelectedPaymentMethod(response.data[0].id); // Seleciona o primeiro método como padrão
      }
    } catch (err) {
      console.error('Erro ao buscar métodos de pagamento:', err);
      setError('Erro ao carregar métodos de pagamento.');
    }
  };

  const fetchOrder = async (id) => {
    try {
      const response = await api.get(`/api/orders/${id}`);
      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar pedido:', err);
      setError('Erro ao carregar pedido.');
      setLoading(false);
    }
  };

  const fetchKitchenStatus = async () => {
    if (!pedidoId) return;
    try {
      const res = await api.get('/api/kitchen/tickets');
      // Agrupar por order_item_id
      const statusMap = {};
      res.data.forEach(item => {
        if (item.order_id === Number(pedidoId)) {
          statusMap[item.order_item_id] = item.preparation_status;
        }
      });
      setKitchenStatus(statusMap);
    } catch (err) {
      setKitchenStatus({});
    }
  };

  const openModifierModal = async (product) => {
    setSelectedProduct(product);
    setSelectedModifiers([]);
    try {
      const res = await api.get(`/api/product-modifiers?product_id=${product.id}`);
      setModifiers(res.data);
      setModifierModalOpen(true);
    } catch (err) {
      setModifiers([]);
      setModifierModalOpen(true);
    }
  };

  const closeModifierModal = () => {
    setModifierModalOpen(false);
    setSelectedProduct(null);
    setModifiers([]);
    setSelectedModifiers([]);
  };

  const handleToggleModifier = (modifierId) => {
    setSelectedModifiers((prev) =>
      prev.includes(modifierId)
        ? prev.filter((id) => id !== modifierId)
        : [...prev, modifierId]
    );
  };

  const handleAddItemWithModifiers = async () => {
    if (!selectedProduct) return;
    try {
      await api.post(`/api/orders/${pedidoId}/items`, {
        product_id: selectedProduct.id,
        quantity: 1,
        modifier_ids: selectedModifiers,
      });
      fetchOrder(pedidoId);
      closeModifierModal();
      alert('Item adicionado ao pedido!');
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      alert('Erro ao adicionar item ao pedido.');
    }
  };

  const handleUpdateItemQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      await api.put(`/api/orders/${pedidoId}/items/${itemId}`, {
        quantity: newQuantity,
      });
      fetchOrder(pedidoId);
      alert('Quantidade do item atualizada!');
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err);
      alert('Erro ao atualizar quantidade do item.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Tem certeza que deseja remover este item do pedido?')) {
      try {
        await api.delete(`/api/orders/${pedidoId}/items/${itemId}`);
        fetchOrder(pedidoId);
        alert('Item removido do pedido!');
      } catch (err) {
        console.error('Erro ao remover item:', err);
        alert('Erro ao remover item do pedido.');
      }
    }
  };

  const handleCloseOrder = async () => {
    if (!selectedPaymentMethod) {
      alert('Por favor, selecione um método de pagamento.');
      return;
    }
    if (window.confirm('Deseja fechar este pedido e registrar o pagamento?')) {
      try {
        await api.post('/api/payments', {
          order_id: pedidoId,
          payment_method_id: selectedPaymentMethod,
          amount: order.total_amount, // Usar o total do pedido
        });
        alert(`Pedido ${pedidoId} fechado e pagamento registrado! Total: R$ ${order.total_amount.toFixed(2)}`);
        navigate('/garcom/mesas'); // Redireciona para a tela de mesas após fechar o pedido
      } catch (err) {
        console.error('Erro ao fechar pedido e registrar pagamento:', err);
        alert('Erro ao fechar pedido e registrar pagamento.');
      }
    }
  };

  const statusLabels = {
    pending: 'Pendente',
    preparing: 'Em Preparo',
    done: 'Pronto',
    served: 'Entregue',
  };

  if (loading) return <div className="p-4">Carregando pedido...</div>;
  if (error) return <div className="p-4 text-red-500">Erro: {error}</div>;
  if (!order) return <div className="p-4">Nenhum pedido selecionado ou encontrado.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pedido #{pedidoId}</h1>

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Cardápio</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {products.map((p) => (
            <div key={p.id} className="border p-2 rounded">
              <h3 className="font-medium">{p.name}</h3>
              <p className="text-sm">R$ {p.price ? p.price.toFixed(2) : 'N/A'}</p>
              <Button
                onClick={() => openModifierModal(p)}
                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                variant="contained"
                color="primary"
              >
                +1
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={modifierModalOpen} onClose={closeModifierModal} maxWidth="sm" fullWidth>
        <DialogTitle>Personalizar Item</DialogTitle>
        <DialogContent>
          <div className="mb-2 font-semibold">{selectedProduct ? selectedProduct.name : ''}</div>
          {modifiers.length === 0 && <div>Nenhum modificador disponível para este produto.</div>}
          {modifiers.map((mod) => (
            <div key={mod.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`mod-${mod.id}`}
                checked={selectedModifiers.includes(mod.id)}
                onChange={() => handleToggleModifier(mod.id)}
                className="mr-2"
              />
              <label htmlFor={`mod-${mod.id}`}>{mod.nome} ({mod.tipo}) {mod.ajuste_preco ? `(+R$ ${parseFloat(mod.ajuste_preco).toFixed(2)})` : ''}</label>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddItemWithModifiers} color="primary" variant="contained">
            Adicionar ao Pedido
          </Button>
          <Button onClick={closeModifierModal} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <div>
        <h2 className="font-semibold mb-2">Itens no Pedido</h2>
        {order.items && order.items.length > 0 ? (
          <ul className="list-disc pl-5 mb-4">
            {order.items.map((item) => (
              <li key={item.id} className="mb-2">
                {item.quantity}x {item.product_name} – R$ {(item.total_price).toFixed(2)}
                {kitchenStatus[item.id] && (
                  <span className="ml-2 px-2 py-1 rounded text-xs bg-gray-200">
                    Status: {statusLabels[kitchenStatus[item.id]]}
                  </span>
                )}
                <div className="inline-flex ml-4">
                  <button
                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                    className="bg-red-500 text-white py-0.5 px-2 rounded-l"
                  >
                    -
                  </button>
                  <span className="px-2 py-0.5 border-t border-b">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                    className="bg-green-500 text-white py-0.5 px-2 rounded-r"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-2 bg-gray-500 text-white py-0.5 px-2 rounded"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum item neste pedido ainda.</p>
        )}
        <p className="text-xl font-bold mt-4">Total do Pedido: R$ {order.total_amount ? order.total_amount.toFixed(2) : '0.00'}</p>

        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">Método de Pagamento:</label>
          <select
            id="paymentMethod"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          >
            {paymentMethods.map(method => (
              <option key={method.id} value={method.id}>{method.name}</option>
            ))}
          </select>
        </div>

        <button onClick={handleCloseOrder} className="mt-4 bg-green-600 text-white py-2 px-4 rounded">
          Fechar Conta e Pagar
        </button>
      </div>
    </div>
  );
}
