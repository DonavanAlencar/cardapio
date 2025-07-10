import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminProductModifiers = () => {
  const [modifiers, setModifiers] = useState([]);
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [newModifierName, setNewModifierName] = useState('');
  const [newModifierType, setNewModifierType] = useState('ADICAO');
  const [newModifierProductId, setNewModifierProductId] = useState('');
  const [newModifierIngredientId, setNewModifierIngredientId] = useState('');
  const [newModifierFactorConsumo, setNewModifierFactorConsumo] = useState(1.0);
  const [newModifierAjustePreco, setNewModifierAjustePreco] = useState(0.00);
  const [editingModifier, setEditingModifier] = useState(null);

  useEffect(() => {
    fetchModifiers();
    fetchProducts();
    fetchIngredients();
  }, []);

  const fetchModifiers = async () => {
    try {
      const response = await api.get('/api/product-modifiers');
      setModifiers(response.data);
    } catch (error) {
      console.error('Erro ao buscar modificadores:', error);
      alert('Erro ao buscar modificadores.');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
      if (response.data.length > 0) {
        setNewModifierProductId(response.data[0].id); // Define o primeiro produto como padrão
      }
    } catch (error) {
      console.error('Erro ao buscar produtos para modificadores:', error);
    }
  };

  const fetchIngredients = async () => {
    try {
      // Assumindo que você terá uma API para ingredientes
      // Por enquanto, vou simular alguns ingredientes ou você precisará criar a API de ingredientes
      // Ex: const response = await api.get('/api/ingredients');
      // setIngredients(response.data);
      setIngredients([
        { id: 1, nome: 'Gelo' },
        { id: 2, nome: 'Queijo' },
        { id: 3, nome: 'Carne' },
      ]);
      if (ingredients.length > 0) {
        setNewModifierIngredientId(ingredients[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error);
    }
  };

  const handleAddModifier = async () => {
    if (!newModifierName.trim() || !newModifierProductId || !newModifierType) {
      alert('Nome, produto e tipo do modificador são obrigatórios.');
      return;
    }
    try {
      const response = await api.post('/api/product-modifiers', {
        product_id: newModifierProductId,
        nome: newModifierName,
        tipo: newModifierType,
        ingrediente_id: newModifierIngredientId || null,
        fator_consumo: newModifierFactorConsumo,
        ajuste_preco: newModifierAjustePreco,
      });
      setModifiers([...modifiers, { ...response.data, product_name: products.find(p => p.id === response.data.product_id)?.name, ingrediente_nome: ingredients.find(i => i.id === response.data.ingrediente_id)?.nome }]);
      setNewModifierName('');
      setNewModifierType('ADICAO');
      setNewModifierIngredientId(ingredients.length > 0 ? ingredients[0].id : '');
      setNewModifierFactorConsumo(1.0);
      setNewModifierAjustePreco(0.00);
      alert('Modificador adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar modificador:', error);
      alert('Erro ao adicionar modificador.');
    }
  };

  const handleEditClick = (modifier) => {
    setEditingModifier(modifier);
    setNewModifierName(modifier.nome);
    setNewModifierType(modifier.tipo);
    setNewModifierProductId(modifier.product_id);
    setNewModifierIngredientId(modifier.ingrediente_id || '');
    setNewModifierFactorConsumo(modifier.fator_consumo);
    setNewModifierAjustePreco(modifier.ajuste_preco);
  };

  const handleUpdateModifier = async () => {
    if (!newModifierName.trim() || !newModifierProductId || !newModifierType) {
      alert('Nome, produto e tipo do modificador são obrigatórios.');
      return;
    }
    try {
      const response = await api.put(`/api/product-modifiers/${editingModifier.id}`, {
        product_id: newModifierProductId,
        nome: newModifierName,
        tipo: newModifierType,
        ingrediente_id: newModifierIngredientId || null,
        fator_consumo: newModifierFactorConsumo,
        ajuste_preco: newModifierAjustePreco,
      });
      setModifiers(modifiers.map(mod => (mod.id === editingModifier.id ? { ...response.data, product_name: products.find(p => p.id === response.data.product_id)?.name, ingrediente_nome: ingredients.find(i => i.id === response.data.ingrediente_id)?.nome } : mod)));
      setEditingModifier(null);
      setNewModifierName('');
      setNewModifierType('ADICAO');
      setNewModifierIngredientId(ingredients.length > 0 ? ingredients[0].id : '');
      setNewModifierFactorConsumo(1.0);
      setNewModifierAjustePreco(0.00);
      alert('Modificador atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar modificador:', error);
      alert('Erro ao atualizar modificador.');
    }
  };

  const handleDeleteModifier = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este modificador?')) {
      try {
        await api.delete(`/api/product-modifiers/${id}`);
        setModifiers(modifiers.filter(mod => mod.id !== id));
        alert('Modificador deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar modificador:', error);
        alert('Erro ao deletar modificador.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Modificadores de Produtos</h1>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-2">{editingModifier ? 'Editar Modificador' : 'Adicionar Novo Modificador'}</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modifierName">Nome:</label>
          <input
            type="text"
            id="modifierName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newModifierName}
            onChange={(e) => setNewModifierName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modifierProduct">Produto:</label>
          <select
            id="modifierProduct"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newModifierProductId}
            onChange={(e) => setNewModifierProductId(e.target.value)}
          >
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modifierType">Tipo:</label>
          <select
            id="modifierType"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newModifierType}
            onChange={(e) => setNewModifierType(e.target.value)}
          >
            <option value="ADICAO">Adição</option>
            <option value="REMOCAO">Remoção</option>
            <option value="SUBSTITUICAO">Substituição</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modifierIngredient">Ingrediente (opcional):</label>
          <select
            id="modifierIngredient"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newModifierIngredientId}
            onChange={(e) => setNewModifierIngredientId(e.target.value)}
          >
            <option value="">Nenhum</option>
            {ingredients.map(ingredient => (
              <option key={ingredient.id} value={ingredient.id}>{ingredient.nome}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modifierFactorConsumo">Fator de Consumo:</label>
          <input
            type="number"
            id="modifierFactorConsumo"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newModifierFactorConsumo}
            onChange={(e) => setNewModifierFactorConsumo(parseFloat(e.target.value))}
            step="0.01"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modifierAjustePreco">Ajuste de Preço:</label>
          <input
            type="number"
            id="modifierAjustePreco"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newModifierAjustePreco}
            onChange={(e) => setNewModifierAjustePreco(parseFloat(e.target.value))}
            step="0.01"
          />
        </div>
        {editingModifier ? (
          <button
            onClick={handleUpdateModifier}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Atualizar Modificador
          </button>
        ) : (
          <button
            onClick={handleAddModifier}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Adicionar Modificador
          </button>
        )}
        {editingModifier && (
          <button
            onClick={() => {
              setEditingModifier(null);
              setNewModifierName('');
              setNewModifierType('ADICAO');
              setNewModifierProductId(products.length > 0 ? products[0].id : '');
              setNewModifierIngredientId(ingredients.length > 0 ? ingredients[0].id : '');
              setNewModifierFactorConsumo(1.0);
              setNewModifierAjustePreco(0.00);
            }}
            className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-2">Modificadores Existentes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">Produto</th>
              <th className="py-2 px-4 border-b">Tipo</th>
              <th className="py-2 px-4 border-b">Ingrediente</th>
              <th className="py-2 px-4 border-b">Fator Consumo</th>
              <th className="py-2 px-4 border-b">Ajuste Preço</th>
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {modifiers.map((modifier) => (
              <tr key={modifier.id}>
                <td className="py-2 px-4 border-b text-center">{modifier.id}</td>
                <td className="py-2 px-4 border-b">{modifier.nome}</td>
                <td className="py-2 px-4 border-b">{modifier.product_name}</td>
                <td className="py-2 px-4 border-b">{modifier.tipo}</td>
                <td className="py-2 px-4 border-b">{modifier.ingrediente_nome || 'N/A'}</td>
                <td className="py-2 px-4 border-b text-center">{modifier.fator_consumo}</td>
                <td className="py-2 px-4 border-b text-center">{modifier.ajuste_preco.toFixed(2)}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleEditClick(modifier)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteModifier(modifier.id)}
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

export default AdminProductModifiers;
