// frontend/src/pages/AdminGarcons.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function AdminGarcons() {
  const [garcons, setGarcons] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    branch_id: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchGarcons();
    fetchBranches();
  }, []);

  async function fetchGarcons() {
    try {
      const res = await api.get('/garcons');
      setGarcons(res.data);
    } catch (err) {
      console.error('Erro ao buscar garçons:', err);
    }
  }

  async function fetchBranches() {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch (err) {
      console.error('Erro ao buscar filiais:', err);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/garcons/${editingId}`, form);
      } else {
        await api.post('/garcons', form);
      }
      setForm({ username: '', email: '', password: '', branch_id: '' });
      setEditingId(null);
      fetchGarcons();
      closeModal();
    } catch (err) {
      console.error('Erro ao salvar garçom:', err);
      alert('Não foi possível salvar o garçom.');
    }
  }

  function handleEdit(g) {
    setEditingId(g.id);
    setForm({
      username: g.username,
      email: g.email,
      password: '',
      branch_id: String(g.branch_id),
    });
    setModalOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Confirma exclusão deste garçom?')) return;
    try {
      await api.delete(`/garcons/${id}`);
      fetchGarcons();
    } catch (err) {
      console.error('Erro ao excluir garçom:', err);
      alert('Não foi possível excluir o garçom.');
    }
  }

  const openAddModal = () => {
    setEditingId(null);
    setForm({ username: '', email: '', password: '', branch_id: '' });
    setModalOpen(true);
  };

  const openEditModal = (g) => {
    setEditingId(g.id);
    setForm({
      username: g.username,
      email: g.email,
      password: '',
      branch_id: String(g.branch_id),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Garçons</h1>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <Button variant="contained" color="primary" onClick={openAddModal}>
          Adicionar Garçom
        </Button>
      </div>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Garçom' : 'Adicionar Garçom'}</DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Nome de Usuário:</label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={form.username}
              name="username"
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={form.email}
              name="email"
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={form.password}
              name="password"
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="branch_id">Filial:</label>
            <select
              id="branch_id"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={form.branch_id}
              name="branch_id"
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingId ? 'Atualizar Garçom' : 'Adicionar Garçom'}
          </Button>
          <Button onClick={closeModal} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <h2 className="text-xl font-semibold mb-2">Garçons Cadastrados</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-200 text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Usuário</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Filial</th>
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {garcons.map((g) => (
              <tr key={g.id}>
                <td className="py-2 px-4 border-b text-center">{g.id}</td>
                <td className="py-2 px-4 border-b">{g.username}</td>
                <td className="py-2 px-4 border-b">{g.email}</td>
                <td className="py-2 px-4 border-b">{branches.find(b => b.id === g.branch_id)?.name || '-'}</td>
                <td className="py-2 px-4 border-b text-center">
                  <Button onClick={() => openEditModal(g)} color="warning" variant="contained" size="small" style={{ marginRight: 8 }}>
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
}
