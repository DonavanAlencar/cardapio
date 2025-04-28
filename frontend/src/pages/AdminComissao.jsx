// frontend/src/pages/AdminComissao.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminComissao() {
  const [percentual, setPercentual] = useState(0);

  useEffect(() => {
    api.get('/configuracoes/comissao').then(res => setPercentual(res.data.percentual));
  }, []);

  async function salvar() {
    await api.put('/configuracoes/comissao', { percentual });
    alert('Percentual atualizado!');
  }

  return (
    <div className="p-4 max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Configurar Comissão</h1>
      <div className="flex gap-2 mb-4">
        <input type="number" value={percentual}
          onChange={e=>setPercentual(e.target.value)} className="border p-2 flex-1" />
        <span className="self-center">%</span>
      </div>
      <button onClick={salvar} className="bg-blue-600 text-white py-2 px-4 rounded">
        Salvar
      </button>
    </div>
  );
}
