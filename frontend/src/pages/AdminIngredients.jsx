import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const AdminIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('');
  const [newIngredientStock, setNewIngredientStock] = useState(0);
  const [newIngredientMinStock, setNewIngredientMinStock] = useState(0);
  const [newIngredientActive, setNewIngredientActive] = useState(true);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [entradaModalOpen, setEntradaModalOpen] = useState(false);
  const [entradaIngredienteId, setEntradaIngredienteId] = useState('');
  const [entradaQuantidade, setEntradaQuantidade] = useState(0);
  const [entradaReferencia, setEntradaReferencia] = useState('');

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients');
      setIngredients(response.data);
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error);
      alert('Erro ao buscar ingredientes.');
    }
  };

  const handleAddIngredient = async () => {
    if (!newIngredientName.trim() || !newIngredientUnit.trim()) {
      alert('Nome e unidade de medida são obrigatórios.');
      return;
    }
    try {
      const response = await api.post('/ingredients', {
        nome: newIngredientName,
        unidade_medida: newIngredientUnit,
        quantidade_estoque: newIngredientStock,
        quantidade_minima: newIngredientMinStock,
        ativo: newIngredientActive,
      });
      setIngredients([...ingredients, response.data]);
      setNewIngredientName('');
      setNewIngredientUnit('');
      setNewIngredientStock(0);
      setNewIngredientMinStock(0);
      setNewIngredientActive(true);
      alert('Ingrediente adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar ingrediente:', error);
      alert('Erro ao adicionar ingrediente.');
    }
  };

  const handleEditClick = (ingredient) => {
    setEditingIngredient(ingredient);
    setNewIngredientName(ingredient.nome);
    setNewIngredientUnit(ingredient.unidade_medida);
    setNewIngredientStock(ingredient.quantidade_estoque);
    setNewIngredientMinStock(ingredient.quantidade_minima);
    setNewIngredientActive(ingredient.ativo === 1);
  };

  const handleUpdateIngredient = async () => {
    if (!newIngredientName.trim() || !newIngredientUnit.trim()) {
      alert('Nome e unidade de medida são obrigatórios.');
      return;
    }
    try {
      const response = await api.put(`/ingredients/${editingIngredient.id}`, {
        nome: newIngredientName,
        unidade_medida: newIngredientUnit,
        quantidade_estoque: newIngredientStock,
        quantidade_minima: newIngredientMinStock,
        ativo: newIngredientActive,
      });
      setIngredients(ingredients.map(ing => (ing.id === editingIngredient.id ? response.data : ing)));
      setEditingIngredient(null);
      setNewIngredientName('');
      setNewIngredientUnit('');
      setNewIngredientStock(0);
      setNewIngredientMinStock(0);
      setNewIngredientActive(true);
      alert('Ingrediente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar ingrediente:', error);
      alert('Erro ao atualizar ingrediente.');
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este ingrediente?')) {
      try {
        await api.delete(`/ingredients/${id}`);
        setIngredients(ingredients.filter(ing => ing.id !== id));
        alert('Ingrediente deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar ingrediente:', error);
        alert('Erro ao deletar ingrediente.');
      }
    }
  };

  const openAddModal = () => {
    setEditingIngredient(null);
    setNewIngredientName('');
    setNewIngredientUnit('');
    setNewIngredientStock(0);
    setNewIngredientMinStock(0);
    setNewIngredientActive(true);
    setModalOpen(true);
  };

  const openEditModal = (ingredient) => {
    setEditingIngredient(ingredient);
    setNewIngredientName(ingredient.nome);
    setNewIngredientUnit(ingredient.unidade_medida);
    setNewIngredientStock(ingredient.quantidade_estoque);
    setNewIngredientMinStock(ingredient.quantidade_minima);
    setNewIngredientActive(ingredient.ativo === 1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const openEntradaModal = (id) => {
    setEntradaIngredienteId(id);
    setEntradaQuantidade(0);
    setEntradaReferencia('');
    setEntradaModalOpen(true);
  };
  const closeEntradaModal = () => {
    setEntradaModalOpen(false);
  };
  const handleRegistrarEntrada = async () => {
    try {
      await api.post('/stock-movements', {
        ingrediente_id: entradaIngredienteId,
        tipo_movimento: 'ENTRADA',
        quantidade: entradaQuantidade,
        referencia: entradaReferencia,
      });
      fetchIngredients();
      closeEntradaModal();
      alert('Entrada registrada com sucesso!');
    } catch (error) {
      alert('Erro ao registrar entrada de insumo.');
    }
  };

  return (
    <Box
      className="container mx-auto p-4"
      sx={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}
    >
      <Typography variant="h4" fontWeight="bold" mb={2} color="text.primary">
        Gerenciar Ingredientes
      </Typography>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <Button variant="contained" color="primary" onClick={openAddModal}>
          Adicionar Ingrediente
        </Button>
      </div>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIngredient ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}</DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ingredientName">Nome:</label>
            <input
              type="text"
              id="ingredientName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newIngredientName}
              onChange={(e) => setNewIngredientName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ingredientUnit">Unidade de Medida:</label>
            <input
              type="text"
              id="ingredientUnit"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newIngredientUnit}
              onChange={(e) => setNewIngredientUnit(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ingredientStock">Quantidade em Estoque:</label>
            <input
              type="number"
              id="ingredientStock"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newIngredientStock}
              onChange={(e) => setNewIngredientStock(parseFloat(e.target.value))}
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ingredientMinStock">Quantidade Mínima:</label>
            <input
              type="number"
              id="ingredientMinStock"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newIngredientMinStock}
              onChange={(e) => setNewIngredientMinStock(parseFloat(e.target.value))}
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ingredientActive">Ativo:</label>
            <input
              type="checkbox"
              id="ingredientActive"
              className="mr-2 leading-tight"
              checked={newIngredientActive}
              onChange={(e) => setNewIngredientActive(e.target.checked)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          {editingIngredient ? (
            <Button onClick={async () => { await handleUpdateIngredient(); closeModal(); }} color="primary" variant="contained">
              Atualizar Ingrediente
            </Button>
          ) : (
            <Button onClick={async () => { await handleAddIngredient(); closeModal(); }} color="success" variant="contained">
              Adicionar Ingrediente
            </Button>
          )}
          <Button onClick={closeModal} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={entradaModalOpen} onClose={closeEntradaModal} maxWidth="xs" fullWidth>
        <DialogTitle>Registrar Entrada de Insumo</DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Quantidade:</label>
            <input
              type="number"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={entradaQuantidade}
              onChange={e => setEntradaQuantidade(parseFloat(e.target.value))}
              min="0"
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Referência (opcional):</label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={entradaReferencia}
              onChange={e => setEntradaReferencia(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRegistrarEntrada} color="primary" variant="contained">Registrar</Button>
          <Button onClick={closeEntradaModal} color="secondary" variant="outlined">Cancelar</Button>
        </DialogActions>
      </Dialog>

      <h2 className="text-xl font-semibold mb-2">Ingredientes Existentes</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-200 text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">Unidade</th>
              <th className="py-2 px-4 border-b">Estoque</th>
              <th className="py-2 px-4 border-b">Mínimo</th>
              <th className="py-2 px-4 border-b">Ativo</th>
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td className="py-2 px-4 border-b text-center">{ingredient.id}</td>
                <td className="py-2 px-4 border-b">{ingredient.nome}</td>
                <td className="py-2 px-4 border-b">{ingredient.unidade_medida}</td>
                <td className="py-2 px-4 border-b text-center" style={{ background: ingredient.quantidade_estoque < ingredient.quantidade_minima ? '#ffe5e5' : undefined }}>
                  {ingredient.quantidade_estoque}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {ingredient.quantidade_minima}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {ingredient.ativo ? 'Sim' : 'Não'}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <Button onClick={() => openEditModal(ingredient)} color="warning" variant="contained" size="small" style={{ marginRight: 8 }}>
                    Editar
                  </Button>
                  <Button onClick={() => handleDeleteIngredient(ingredient.id)} color="error" variant="contained" size="small" style={{ marginRight: 8 }}>
                    Deletar
                  </Button>
                  <Button onClick={() => openEntradaModal(ingredient.id)} color="success" variant="outlined" size="small">
                    Entrada
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
};

export default AdminIngredients;
