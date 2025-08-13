import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function GarcomMesas() {
  const [tables, setTables] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (err) {
      console.error('Erro ao buscar mesas:', err);
      alert('Erro ao buscar mesas.');
    }
  };

  const handleCreateTableOrder = async (tableId) => {
    try {
      // Criar um novo pedido associado à mesa
      const response = await api.post('/orders', { table_id: tableId });
      const newOrderId = response.data.id;
      alert(`Pedido ${newOrderId} criado para a mesa ${tableId}!`);
      navigate(`/garcom/pedido/${newOrderId}`);
    } catch (err) {
      console.error('Erro ao criar pedido para mesa:', err);
      alert('Erro ao criar pedido para mesa.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mesas Disponíveis</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`border p-4 rounded-lg shadow-md text-center
              ${table.status === 'available' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}
          >
            <h2 className="text-xl font-semibold">Mesa {table.table_number}</h2>
            <p className="text-gray-600">Capacidade: {table.capacity}</p>
            <p className="text-gray-600">Status: {table.status}</p>
            {table.status === 'available' && (
              <button
                onClick={() => handleCreateTableOrder(table.id)}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Criar Pedido
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}