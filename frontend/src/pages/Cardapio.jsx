import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Cardapio() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/product-categories');
      setCategorias([{ id: 'todas', name: 'Todas' }, ...response.data]);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const exibidos = filtro === 'todas'
    ? produtos
    : produtos.filter(p => p.category_id === filtro);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Cardápio</h1>
      <div className="flex justify-center gap-3 mb-6">
        {categorias.map(cat => (
          <button key={cat.id}
            onClick={() => setFiltro(cat.id)}
            className={`px-3 py-1 rounded ${filtro === cat.id ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {exibidos.map(p => (
          <div key={p.id} className="bg-white rounded shadow overflow-hidden">
            {p.image_url && (
              <img src={p.image_url} alt={p.name}
                   className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-gray-700 mb-2">{p.description}</p>
              <p className="text-green-600 font-bold">R$ {p.price ? p.price.toFixed(2) : 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}