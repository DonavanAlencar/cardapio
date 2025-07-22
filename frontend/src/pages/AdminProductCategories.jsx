import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const AdminProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryDisplayOrder, setNewCategoryDisplayOrder] = useState(0);
  const [editingCategory, setEditingCategory] = useState(null); // null ou o objeto da categoria sendo editada
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/product-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      alert('Erro ao buscar categorias.');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('O nome da categoria não pode ser vazio.');
      return;
    }
    try {
      const response = await api.post('/api/product-categories', {
        name: newCategoryName,
        description: newCategoryDescription,
        display_order: newCategoryDisplayOrder,
      });
      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryDisplayOrder(0);
      alert('Categoria adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      alert('Erro ao adicionar categoria.');
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setNewCategoryDisplayOrder(category.display_order || 0);
  };

  const handleUpdateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('O nome da categoria não pode ser vazio.');
      return;
    }
    try {
      const response = await api.put(`/api/product-categories/${editingCategory.id}`, {
        name: newCategoryName,
        description: newCategoryDescription,
        display_order: newCategoryDisplayOrder,
      });
      setCategories(categories.map(cat => (cat.id === editingCategory.id ? response.data : cat)));
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryDisplayOrder(0);
      alert('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      alert('Erro ao atualizar categoria.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        await api.delete(`/api/product-categories/${id}`);
        setCategories(categories.filter(cat => cat.id !== id));
        alert('Categoria deletada com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        alert('Erro ao deletar categoria.');
      }
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryDisplayOrder(0);
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setNewCategoryDisplayOrder(category.display_order || 0);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Categorias de Produtos</h1>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <Button variant="contained" color="primary" onClick={openAddModal}>
          Adicionar Categoria
        </Button>
      </div>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}</DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryName">Nome:</label>
            <input
              type="text"
              id="categoryName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryDescription">Descrição:</label>
            <textarea
              id="categoryDescription"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryDisplayOrder">Ordem de Exibição:</label>
            <input
              type="number"
              id="categoryDisplayOrder"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newCategoryDisplayOrder}
              onChange={(e) => setNewCategoryDisplayOrder(Number(e.target.value))}
            />
          </div>
        </DialogContent>
        <DialogActions>
          {editingCategory ? (
            <Button onClick={async () => { await handleUpdateCategory(); closeModal(); }} color="primary" variant="contained">
              Atualizar Categoria
            </Button>
          ) : (
            <Button onClick={async () => { await handleAddCategory(); closeModal(); }} color="success" variant="contained">
              Adicionar Categoria
            </Button>
          )}
          <Button onClick={closeModal} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <h2 className="text-xl font-semibold mb-2">Categorias Existentes</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-200 text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">Descrição</th>
              <th className="py-2 px-4 border-b">Ordem</th>
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="py-2 px-4 border-b text-center">{category.id}</td>
                <td className="py-2 px-4 border-b">{category.name}</td>
                <td className="py-2 px-4 border-b">{category.description}</td>
                <td className="py-2 px-4 border-b text-center">{category.display_order}</td>
                <td className="py-2 px-4 border-b text-center">
                  <Button onClick={() => openEditModal(category)} color="warning" variant="contained" size="small" style={{ marginRight: 8 }}>
                    Editar
                  </Button>
                  <Button onClick={() => handleDeleteCategory(category.id)} color="error" variant="contained" size="small">
                    Deletar
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

export default AdminProductCategories;
