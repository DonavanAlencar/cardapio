import React, { useState, useEffect } from 'react';
import api from '../services/api';
import jwt_decode from 'jwt-decode';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const AdminMesas = () => {
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(1);
  const [newTableStatus, setNewTableStatus] = useState('available');
  const [editingTable, setEditingTable] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
      alert('Erro ao buscar mesas.');
    }
  };

  // Adiciona obtenção do branch_id do token
  const getBranchId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const user = jwt_decode(token);
      return user.branch_id;
    } catch {
      return null;
    }
  };

  const handleAddTable = async () => {
    if (!newTableNumber.trim() || !newTableCapacity) {
      alert('Número da mesa e capacidade são obrigatórios.');
      return;
    }
    const branch_id = getBranchId();
    if (!branch_id) {
      alert('Não foi possível identificar a filial do usuário.');
      return;
    }
    try {
      const response = await api.post('/tables', {
        table_number: newTableNumber,
        capacity: newTableCapacity,
        status: newTableStatus,
        branch_id,
      });
      setTables([...tables, response.data]);
      setNewTableNumber('');
      setNewTableCapacity(1);
      setNewTableStatus('available');
      alert('Mesa adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar mesa:', error);
      alert('Erro ao adicionar mesa.');
    }
  };

  const handleEditClick = (table) => {
    setEditingTable(table);
    setNewTableNumber(table.table_number);
    setNewTableCapacity(table.capacity);
    setNewTableStatus(table.status);
  };

  const handleUpdateTable = async () => {
    if (!newTableNumber.trim() || !newTableCapacity) {
      alert('Número da mesa e capacidade são obrigatórios.');
      return;
    }
    const branch_id = getBranchId();
    if (!branch_id) {
      alert('Não foi possível identificar a filial do usuário.');
      return;
    }
    try {
      const response = await api.put(`/tables/${editingTable.id}`, {
        table_number: newTableNumber,
        capacity: newTableCapacity,
        status: newTableStatus,
        branch_id,
      });
      setTables(tables.map(tbl => (tbl.id === editingTable.id ? response.data : tbl)));
      setEditingTable(null);
      setNewTableNumber('');
      setNewTableCapacity(1);
      setNewTableStatus('available');
      alert('Mesa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar mesa:', error);
      alert('Erro ao atualizar mesa.');
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta mesa?')) {
      try {
        await api.delete(`/tables/${id}`);
        setTables(tables.filter(tbl => tbl.id !== id));
        alert('Mesa deletada com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar mesa:', error);
        alert('Erro ao deletar mesa.');
      }
    }
  };

  return (
  <Box
      className="container mx-auto p-4"
      sx={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}
    >
      <Typography variant="h4" fontWeight="bold" mb={2} color="text.primary">
        Gerenciar Mesas
      </Typography>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-2">{editingTable ? 'Editar Mesa' : 'Adicionar Nova Mesa'}</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tableNumber">Número da Mesa:</label>
          <input
            type="text"
            id="tableNumber"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tableCapacity">Capacidade:</label>
          <input
            type="number"
            id="tableCapacity"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newTableCapacity}
            onChange={(e) => setNewTableCapacity(parseInt(e.target.value))}
            min="1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tableStatus">Status:</label>
          <select
            id="tableStatus"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newTableStatus}
            onChange={(e) => setNewTableStatus(e.target.value)}
          >
            <option value="available">Disponível</option>
            <option value="occupied">Ocupada</option>
            <option value="reserved">Reservada</option>
          </select>
        </div>
        {editingTable ? (
          <button
            onClick={handleUpdateTable}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Atualizar Mesa
          </button>
        ) : (
          <button
            onClick={handleAddTable}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Adicionar Mesa
          </button>
        )}
        {editingTable && (
          <button
            onClick={() => {
              setEditingTable(null);
              setNewTableNumber('');
              setNewTableCapacity(1);
              setNewTableStatus('available');
            }}
            className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-2">Mesas Existentes</h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-200 text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Número</th>
              <th className="py-2 px-4 border-b">Capacidade</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.id}>
                <td className="py-2 px-4 border-b text-center">{table.id}</td>
                <td className="py-2 px-4 border-b">{table.table_number}</td>
                <td className="py-2 px-4 border-b text-center">{table.capacity}</td>
                <td className="py-2 px-4 border-b text-center">{table.status}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleEditClick(table)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
};

export default AdminMesas;