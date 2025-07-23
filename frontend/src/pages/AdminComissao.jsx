// frontend/src/pages/AdminComissao.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function AdminComissao() {
  const [percentual, setPercentual] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

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
        <span className="self-center">Percentual atual: <b>{percentual}%</b></span>
        <Button onClick={openModal} color="primary" variant="contained" size="small">Editar</Button>
      </div>
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="xs" fullWidth>
        <DialogTitle>Editar Percentual de Comissão</DialogTitle>
        <DialogContent>
          <input type="number" value={percentual}
            onChange={e=>setPercentual(e.target.value)} className="border p-2 flex-1 w-full" />
        </DialogContent>
        <DialogActions>
          <Button onClick={async () => { await salvar(); closeModal(); }} color="primary" variant="contained">Salvar</Button>
          <Button onClick={closeModal} color="secondary" variant="outlined">Cancelar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
