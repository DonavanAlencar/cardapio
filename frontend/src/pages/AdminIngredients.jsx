import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('');
  const [newIngredientStock, setNewIngredientStock] = useState(0);
  const [newIngredientMinStock, setNewIngredientMinStock] = useState(0);
  const [newIngredientActive, setNewIngredientActive] = useState(true);
  const [editingIngredient, setEditingIngredient] = useState(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/api/ingredients');
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
      const response = await api.post('/api/ingredients', {
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
      const response = await api.put(`/api/ingredients/${editingIngredient.id}`, {
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
        await api.delete(`/api/ingredients/${id}`);
        setIngredients(ingredients.filter(ing => ing.id !== id));
        alert('Ingrediente deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar ingrediente:', error);
        alert('Erro ao deletar ingrediente.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Ingredientes</h1>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-2">{editingIngredient ? 'Editar Ingrediente' : 'Adicionar Novo Ingrediente'}</h2>
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
        {editingIngredient ? (
          <button
            onClick={handleUpdateIngredient}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Atualizar Ingrediente
          </button>
        ) : (
          <button
            onClick={handleAddIngredient}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Adicionar Ingrediente
          </button>
        )}
        {editingIngredient && (
          <button
            onClick={() => {
              setEditingIngredient(null);
              setNewIngredientName('');
              setNewIngredientUnit('');
              setNewIngredientStock(0);
              setNewIngredientMinStock(0);
              setNewIngredientActive(true);
            }}
            className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        )}
      </div>

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
                <td className="py-2 px-4 border-b text-center">{ingredient.quantidade_estoque}</td>
                <td className="py-2 px-4 border-b text-center">{ingredient.quantidade_minima}</td>
                <td className="py-2 px-4 border-b text-center">{ingredient.ativo ? 'Sim' : 'Não'}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleEditClick(ingredient)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteIngredient(ingredient.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminIngredients;
