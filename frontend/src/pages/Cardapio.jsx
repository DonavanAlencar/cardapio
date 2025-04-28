// frontend/src/pages/Cardapio.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Cardapio() {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro]   = useState('todas');

  useEffect(() => {
    api.get('/produtos').then(res => setProdutos(res.data));
  }, []);

  const categorias = ['todas', ...new Set(produtos.map(p=>p.categoria))];
  const exibidos = filtro === 'todas'
    ? produtos
    : produtos.filter(p=>p.categoria === filtro);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Cardápio</h1>
      <div className="flex justify-center gap-3 mb-6">
        {categorias.map(cat => (
          <button key={cat}
            onClick={()=>setFiltro(cat)}
            className={`px-3 py-1 rounded ${filtro===cat?'bg-orange-500 text-white':'bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {exibidos.map(p=>(
          <div key={p.id} className="bg-white rounded shadow overflow-hidden">
            {p.imagem_url && (
              <img src={p.imagem_url} alt={p.nome}
                   className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{p.nome}</h2>
              <p className="text-gray-700 mb-2">{p.descricao}</p>
              <p className="text-green-600 font-bold">R$ {p.preco.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
