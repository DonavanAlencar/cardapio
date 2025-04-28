// frontend/src/pages/AdminMesas.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminMesas() {
  const [mesas, setMesas] = useState([]);
  const [numero, setNumero] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchMesas(); }, []);
  async function fetchMesas() {
    const res = await api.get('/mesas');
    setMesas(res.data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/mesas/${editingId}`, { numero, status: 'livre' });
    } else {
      await api.post('/mesas', { numero });
    }
    setNumero(''); setEditingId(null);
    fetchMesas();
  }

  function handleEdit(m) {
    setEditingId(m.id);
    setNumero(m.numero);
  }

  async function handleDelete(id) {
    if (confirm('Excluir mesa?')) {
      await api.delete(`/mesas/${id}`);
      fetchMesas();
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Mesas</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input value={numero} onChange={e=>setNumero(e.target.value)} placeholder="Número da mesa"
          required className="border p-2 flex-1" />
        <button type="submit" className="bg-green-500 text-white px-4 rounded">
          {editingId ? 'Atualizar' : 'Criar'}
        </button>
      </form>
      <ul>
        {mesas.map(m => (
          <li key={m.id} className="flex justify-between p-2 border-b">
            <span>Mesa {m.numero} ({m.status})</span>
            <div className="space-x-2">
              <button onClick={()=>handleEdit(m)} className="text-blue-600">✎</button>
              <button onClick={()=>handleDelete(m.id)} className="text-red-600">🗑</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
