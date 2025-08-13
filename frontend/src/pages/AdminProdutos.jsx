import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const AdminProdutos = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductStatus, setNewProductStatus] = useState('active');
  const [newProductCategoryId, setNewProductCategoryId] = useState('');
  const [editingProduct, setEditingProduct] = useState(null); // null ou o objeto do produto sendo editado
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      alert('Erro ao buscar produtos.');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/product-categories');
      setCategories(response.data);
      if (response.data.length > 0) {
        setNewProductCategoryId(response.data[0].id); // Define a primeira categoria como padrão
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      alert('Erro ao buscar categorias.');
    }
  };

  const handleAddProduct = async () => {
    if (!newProductName.trim() || !newProductCategoryId) {
      alert('Nome do produto e categoria são obrigatórios.');
      return;
    }
    try {
      const response = await api.post('/products', {
        name: newProductName,
        description: newProductDescription,
        sku: newProductSku,
        status: newProductStatus,
        category_id: newProductCategoryId,
      });
      setProducts([...products, { ...response.data, category_name: categories.find(cat => cat.id === response.data.category_id)?.name }]);
      setNewProductName('');
      setNewProductDescription('');
      setNewProductSku('');
      setNewProductStatus('active');
      alert('Produto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto.');
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setNewProductName(product.name);
    setNewProductDescription(product.description || '');
    setNewProductSku(product.sku || '');
    setNewProductStatus(product.status);
    setNewProductCategoryId(product.category_id);
  };

  const handleUpdateProduct = async () => {
    if (!newProductName.trim() || !newProductCategoryId) {
      alert('Nome do produto e categoria são obrigatórios.');
      return;
    }
    try {
      const response = await api.put(`/products/${editingProduct.id}`, {
        name: newProductName,
        description: newProductDescription,
        sku: newProductSku,
        status: newProductStatus,
        category_id: newProductCategoryId,
      });
      setProducts(products.map(prod => (prod.id === editingProduct.id ? { ...response.data, category_name: categories.find(cat => cat.id === response.data.category_id)?.name } : prod)));
      setEditingProduct(null);
      setNewProductName('');
      setNewProductDescription('');
      setNewProductSku('');
      setNewProductStatus('active');
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(prod => prod.id !== id));
        alert('Produto deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        alert('Erro ao deletar produto.');
      }
    }
  };

  const handleToggleProductStatus = async (product) => {
    try {
      await api.put(`/products/${product.id}`, {
        ...product,
        status: product.status === 'active' ? 'inactive' : 'active',
      });
      fetchProducts();
      alert(`Produto ${product.status === 'active' ? 'inativado' : 'ativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      alert('Erro ao alterar status do produto.');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setNewProductName('');
    setNewProductDescription('');
    setNewProductSku('');
    setNewProductStatus('active');
    setNewProductCategoryId(categories.length > 0 ? categories[0].id : '');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewProductName(product.name);
    setNewProductDescription(product.description || '');
    setNewProductSku(product.sku || '');
    setNewProductStatus(product.status);
    setNewProductCategoryId(product.category_id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Produtos</h1>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <Button variant="contained" color="primary" onClick={openAddModal}>
          Adicionar Novo Produto
        </Button>
      </div>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productName">Nome:</label>
            <input
              type="text"
              id="productName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productDescription">Descrição:</label>
            <textarea
              id="productDescription"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newProductDescription}
              onChange={(e) => setNewProductDescription(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productSku">SKU:</label>
            <input
              type="text"
              id="productSku"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newProductSku}
              onChange={(e) => setNewProductSku(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productStatus">Status:</label>
            <select
              id="productStatus"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newProductStatus}
              onChange={(e) => setNewProductStatus(e.target.value)}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productCategory">Categoria:</label>
            <select
              id="productCategory"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newProductCategoryId}
              onChange={(e) => setNewProductCategoryId(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </DialogContent>
        <DialogActions>
          {editingProduct ? (
            <Button onClick={async () => { await handleUpdateProduct(); closeModal(); }} color="primary" variant="contained">
              Atualizar Produto
            </Button>
          ) : (
            <Button onClick={async () => { await handleAddProduct(); closeModal(); }} color="success" variant="contained">
              Adicionar Produto
            </Button>
          )}
          <Button onClick={closeModal} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <h2 className="text-xl font-semibold mb-2">Produtos Existentes</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-200 text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Nome</th>
              <th className="py-2 px-4 border-b">Categoria</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="py-2 px-4 border-b text-center">{product.id}</td>
                <td className="py-2 px-4 border-b">{product.name}</td>
                <td className="py-2 px-4 border-b">{product.category_name}</td>
                <td className="py-2 px-4 border-b text-center">{product.status === 'active' ? 'Ativo' : 'Inativo'}</td>
                <td className="py-2 px-4 border-b text-center">
                  <Button onClick={() => openEditModal(product)} color="warning" variant="contained" size="small" style={{ marginRight: 8 }}>
                    Editar
                  </Button>
                  <Button onClick={() => handleDeleteProduct(product.id)} color="error" variant="contained" size="small" style={{ marginRight: 8 }}>
                    Deletar
                  </Button>
                  <Button onClick={() => handleToggleProductStatus(product)} color={product.status === 'active' ? 'secondary' : 'success'} variant="outlined" size="small">
                    {product.status === 'active' ? 'Inativar' : 'Ativar'}
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

export default AdminProdutos;