// frontend/src/pages/AdminProdutos.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({ nome:'', descricao:'', preco:0, categoria:'', imagem_url:'' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetch(); }, []);
  async function fetch() {
    const res = await api.get('/produtos');
    setProdutos(res.data);
  }

  function change(e) { setForm({...form,[e.target.name]:e.target.value}); }
  async function submit(e) {
    e.preventDefault();
    if (editingId) await api.put(`/produtos/${editingId}`, form);
    else await api.post('/produtos', form);
    setForm({ nome:'', descricao:'', preco:0, categoria:'', imagem_url:'' });
    setEditingId(null);
    fetch();
  }

  function edit(p) {
    setEditingId(p.id);
    setForm({ nome:p.nome, descricao:p.descricao, preco:p.preco, categoria:p.categoria, imagem_url:p.imagem_url });
  }

  async function del(id) {
    if (confirm('Remover produto?')) {
      await api.delete(`/produtos/${id}`);
      fetch();
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Produtos</h1>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input name="nome"    value={form.nome}    onChange={change} placeholder="Nome"
          required className="border p-2" />
        <input name="descricao" value={form.descricao} onChange={change} placeholder="Descrição"
          className="border p-2" />
        <input name="preco"   type="number" value={form.preco} onChange={change} placeholder="Preço"
          required className="border p-2" />
        <input name="categoria" value={form.categoria} onChange={change} placeholder="Categoria"
          className="border p-2" />
        <input name="imagem_url" value={form.imagem_url} onChange={change} placeholder="URL da Imagem"
          className="border p-2" />
        <button type="submit" className="col-span-full bg-green-500 text-white py-2 rounded">
          {editingId ? 'Atualizar Produto' : 'Cadastrar Produto'}
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {produtos.map(p => (
          <div key={p.id} className="border p-4 rounded shadow">
            <h2 className="font-semibold">{p.nome}</h2>
            <p className="text-sm mb-2">{p.descricao}</p>
            <p className="font-bold">R$ {p.preco.toFixed(2)}</p>
            <div className="mt-2 space-x-2">
              <button onClick={()=>edit(p)} className="text-blue-600">✎</button>
              <button onClick={()=>del(p.id)} className="text-red-600">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
