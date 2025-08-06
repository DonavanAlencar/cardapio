// frontend/src/pages/GarcomComissao.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import jwt_decode from 'jwt-decode';

export default function GarcomComissao() {
  const [comissao, setComissao] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [percentual, setPercentual] = useState(0);
  const [pedidosContabilizados, setPedidosContabilizados] = useState(0);

  useEffect(() => {
    const fetchComissao = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const { id } = jwt_decode(token);
        const response = await api.get(`/garcons/${id}/comissao`);
        setComissao(response.data.comissao);
        setPercentual(response.data.percentual);
        setPedidosContabilizados(response.data.pedidos_contabilizados);
      } catch (err) {
        console.error('Erro ao buscar comissão:', err);
        if (err.response?.status === 404) {
          setError('Garçom não encontrado. Verifique se você está logado corretamente.');
        } else if (err.response?.status === 403) {
          setError('Acesso negado. Você não tem permissão para acessar esta informação.');
        } else {
          setError('Erro ao carregar informações de comissão. Tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComissao();
  }, []);

  if (loading) {
    return (
      <div className="p-4 max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Minha Comissão</h1>
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Minha Comissão</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Minha Comissão</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-lg mb-2">
          Você já acumulou <strong className="text-blue-800">R$ {comissao.toFixed(2)}</strong> em comissões.
        </p>
        <p className="text-sm text-gray-600">
          Percentual de comissão: <strong>{percentual}%</strong>
        </p>
        <p className="text-sm text-gray-600">
          Pedidos contabilizados: <strong>{pedidosContabilizados}</strong>
        </p>
      </div>
      {pedidosContabilizados === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Você ainda não tem pedidos fechados para calcular comissão.
          </p>
        </div>
      )}
    </div>
  );
}
