import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const AdminStockMovements = () => {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [movementType, setMovementType] = useState('ENTRADA');
  const [quantity, setQuantity] = useState(0);
  const [reference, setReference] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/api/ingredients');
      setIngredients(response.data);
      if (response.data.length > 0) {
        setSelectedIngredientId(response.data[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error);
      alert('Erro ao buscar ingredientes.');
    }
  };

  const handleRecordMovement = async () => {
    if (!selectedIngredientId || quantity <= 0) {
      alert('Selecione um ingrediente e insira uma quantidade válida.');
      return;
    }
    try {
      await api.post('/api/stock-movements', {
        ingrediente_id: selectedIngredientId,
        tipo_movimento: movementType,
        quantidade: quantity,
        referencia: reference,
      });
      alert('Movimentação de estoque registrada com sucesso!');
      // Recarregar ingredientes para ver o estoque atualizado
      fetchIngredients();
      setQuantity(0);
      setReference('');
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      alert('Erro ao registrar movimentação de estoque.');
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleRecordMovementAndClose = async () => {
    await handleRecordMovement();
    closeModal();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Movimentações de Estoque</h1>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <Button variant="contained" color="primary" onClick={openModal}>
          Registrar Nova Movimentação
        </Button>
      </div>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Nova Movimentação</DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ingredientSelect">Ingrediente:</label>
            <select
              id="ingredientSelect"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
            >
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.nome} (Estoque: {ing.quantidade_estoque} {ing.unidade_medida})</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="movementType">Tipo de Movimento:</label>
            <select
              id="movementType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
            >
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">Quantidade:</label>
            <input
              type="number"
              id="quantity"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reference">Referência (Opcional):</label>
            <input
              type="text"
              id="reference"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRecordMovementAndClose} color="primary" variant="contained">
            Registrar Movimentação
          </Button>
          <Button onClick={closeModal} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <h2 className="text-xl font-semibold mb-2">Estoque Atual dos Ingredientes</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-200 text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">Unidade</th>
              <th className="py-2 px-4 border-b">Estoque Atual</th>
              <th className="py-2 px-4 border-b">Estoque Mínimo</th>
              <th className="py-2 px-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing) => (
              <tr key={ing.id} className={ing.quantidade_estoque <= ing.quantidade_minima ? 'bg-red-100' : ''}>
                <td className="py-2 px-4 border-b text-center">{ing.id}</td>
                <td className="py-2 px-4 border-b">{ing.nome}</td>
                <td className="py-2 px-4 border-b">{ing.unidade_medida}</td>
                <td className="py-2 px-4 border-b text-center">{ing.quantidade_estoque}</td>
                <td className="py-2 px-4 border-b text-center">{ing.quantidade_minima}</td>
                <td className="py-2 px-4 border-b text-center">
                  {ing.quantidade_estoque <= ing.quantidade_minima ? 'BAIXO' : 'OK'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStockMovements;
