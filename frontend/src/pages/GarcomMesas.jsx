// frontend/src/pages/GarcomMesas.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function GarcomMesas() {
  const [mesas, setMesas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/mesas').then(res => setMesas(res.data));
  }, []);

  async function abrir(mesa) {
    const res = await api.post('/pedidos', { mesaId: mesa.id });
    navigate(`/garcom/pedido/${res.data.pedidoId}`);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Selecione uma Mesa</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {mesas.map(m => (
          <button key={m.id}
            disabled={m.status === 'ocupada'}
            onClick={()=>abrir(m)}
            className={`p-4 rounded shadow text-white ${
              m.status==='ocupada'?'bg-red-500':'bg-green-500'
            }`}
          >
            Mesa {m.numero}
          </button>
        ))}
      </div>
    </div>
  );
}
