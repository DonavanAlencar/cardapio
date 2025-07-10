import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import debugLog from 'debug';

export default function Login() {
  const [email, setEmail] = useState('admin@empresa.com');
  const [senha, setSenha] = useState('admin123');
  const navigate = useNavigate();
  const logUI = debugLog('ui:App');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, password: senha });
      
      // Verifica se a resposta está correta antes de continuar
      if (res.data && res.data.token && res.data.user) {
        console.log(res.data.user.role);
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Redireciona com base na role do usuário
        navigate('/new-features');
      } else {
        // Caso a resposta não seja válida, exibe um erro
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      logUI(err);
      alert('Login falhou');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          required
          className="border w-full p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          required
          className="border w-full p-2 mb-4"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
