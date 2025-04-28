// frontend/src/pages/GarcomPedido.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function GarcomPedido() {
  const { pedidoId } = useParams();
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);

  useEffect(() => {
    api.get('/produtos').then(r=>setProdutos(r.data));
    api.get(`/pedidos/${pedidoId}/itens`).then(r=>setItens(r.data));
  }, [pedidoId]);

  async function add(prod) {
    await api.post(`/pedidos/${pedidoId}/itens`, { produtoId: prod.id, quantidade: 1 });
    setItens(await (await api.get(`/pedidos/${pedidoId}/itens`)).data);
  }

  async function fechar() {
    const res = await api.put(`/pedidos/${pedidoId}/fechar`);
    alert(`Total da conta: R$ ${res.data.total.toFixed(2)}`);
    window.location.href = '/garcom/mesas';
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pedido #{pedidoId}</h1>
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Cardápio</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {produtos.map(p=>(
            <div key={p.id} className="border p-2 rounded">
              <h3 className="font-medium">{p.nome}</h3>
              <p className="text-sm">R$ {p.preco.toFixed(2)}</p>
              <button onClick={()=>add(p)} className="mt-2 bg-blue-500 text-white py-1 px-2 rounded">
                +1
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Itens no Pedido</h2>
        <ul className="list-disc pl-5 mb-4">
          {itens.map((i, idx) => (
            <li key={idx}>{i.quantidade}x {i.nome} – R$ {(i.quantidade * i.preco_unit).toFixed(2)}</li>
          ))}
        </ul>
        <button onClick={fechar} className="bg-green-600 text-white py-2 px-4 rounded">
          Fechar Conta
        </button>
      </div>
    </div>
  );
}
