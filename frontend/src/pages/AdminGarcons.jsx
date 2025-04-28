// frontend/src/pages/AdminGarcons.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminGarcons() {
  const [garcons, setGarcons] = useState([]);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', percentual_comissao: 0 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchGarcons();
  }, []);

  async function fetchGarcons() {
    const res = await api.get('/garcons');
    setGarcons(res.data);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/garcons/${editingId}`, form);
    } else {
      await api.post('/garcons', form);
    }
    setForm({ nome:'', email:'', senha:'', percentual_comissao:0 });
    setEditingId(null);
    fetchGarcons();
  }

  function handleEdit(g) {
    setEditingId(g.id);
    setForm({ nome: g.nome, email: g.email, senha:'', percentual_comissao: g.percentual_comissao });
  }

  async function handleDelete(id) {
    if (window.confirm('Confirma exclusão?')) {
      await api.delete(`/garcons/${id}`);
      fetchGarcons();
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Garçons</h1>
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="nome" value={form.nome} onChange={handleChange}
          placeholder="Nome" required className="border p-2" />
        <input name="email" value={form.email} onChange={handleChange}
          placeholder="Email" required className="border p-2" />
        <input name="senha" type="password" value={form.senha} onChange={handleChange}
          placeholder={editingId ? "Nova senha (opcional)" : "Senha"} 
          className="border p-2" {...(editingId?{}:{required:true})} />
        <input name="percentual_comissao" type="number" value={form.percentual_comissao}
          onChange={handleChange} placeholder="Comissão (%)" required className="border p-2" />
        <button type="submit" className="col-span-full bg-green-500 text-white py-2 rounded">
          {editingId ? 'Atualizar Garçom' : 'Cadastrar Garçom'}
        </button>
      </form>
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Nome</th>
            <th className="p-2">Email</th>
            <th className="p-2">Comissão</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {garcons.map(g => (
            <tr key={g.id} className="border-b">
              <td className="p-2">{g.nome}</td>
              <td className="p-2">{g.email}</td>
              <td className="p-2">{g.percentual_comissao}%</td>
              <td className="p-2 space-x-2">
                <button onClick={()=>handleEdit(g)} className="text-blue-600">✎</button>
                <button onClick={()=>handleDelete(g.id)} className="text-red-600">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
