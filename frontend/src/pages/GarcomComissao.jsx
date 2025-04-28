// frontend/src/pages/GarcomComissao.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import jwt_decode from 'jwt-decode';

export default function GarcomComissao() {
  const [comissao, setComissao] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const { id } = jwt_decode(token);
    api.get(`/garcons/${id}/comissao`).then(res => setComissao(res.data.comissao));
  }, []);

  return (
    <div className="p-4 max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Minha Comissão</h1>
      <p className="text-lg">Você já acumulou <strong>R$ {comissao.toFixed(2)}</strong> em comissões.</p>
    </div>
  );
}
