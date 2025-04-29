// frontend/src/pages/AdminGarcons.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Garçons</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Usuário (login)"
          required
          className="border p-2"
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="border p-2"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder={editingId ? 'Nova senha (opcional)' : 'Senha'}
          required={!editingId}
          className="border p-2"
        />
        <select
          name="branch_id"
          value={form.branch_id}
          onChange={handleChange}
          required
          className="border p-2"
        >
          <option value="">Selecione a filial</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="col-span-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          {editingId ? 'Atualizar Garçom' : 'Cadastrar Garçom'}
        </button>
      </form>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Usuário</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Filial</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {garcons.map(g => (
            <tr key={g.id} className="border-b">
              <td className="p-2">{g.username}</td>
              <td className="p-2">{g.email}</td>
              <td className="p-2">{g.branch_id}</td>
              <td className="p-2 text-center space-x-2">
                <button
                  onClick={() => handleEdit(g)}
                  className="text-blue-600 hover:underline"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(g.id)}
                  className="text-red-600 hover:underline"
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
