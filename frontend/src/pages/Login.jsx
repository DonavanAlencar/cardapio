import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import debugLog from 'debug';

export default function Login() {
  const [email, setEmail] = useState('admin@empresa.com');
  const [senha, setSenha] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const navigate = useNavigate();
  const logUI = debugLog('ui:App');

  // Função para testar conectividade com o backend
  const testBackendConnectivity = async () => {
    console.log('🔍 Testando conectividade com o backend...');
    
    try {
      // Testa endpoint de health
      const healthResponse = await api.get('/health');
      console.log('✅ Health check OK:', healthResponse.data);
      
      // Testa endpoint de diagnóstico
      const diagnosticResponse = await api.get('/diagnostic');
      console.log('🔍 Diagnóstico completo:', diagnosticResponse.data);
      
      // Testa endpoint de teste do banco
      const dbTestResponse = await api.get('/auth/test-db');
      console.log('🗄️ Teste do banco:', dbTestResponse.data);
      
      return {
        health: 'OK',
        diagnostic: diagnosticResponse.data,
        database: dbTestResponse.data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erro no teste de conectividade:', error);
      return {
        health: 'ERROR',
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      };
    }
  };

  // Função para validar dados antes do envio
  const validateFormData = (email, password) => {
    const errors = [];
    
    if (!email) errors.push('Email é obrigatório');
    if (!password) errors.push('Senha é obrigatória');
    if (email && !email.includes('@')) errors.push('Email deve conter @');
    if (password && password.length < 3) errors.push('Senha deve ter pelo menos 3 caracteres');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`🔐 [${requestId}] Iniciando processo de login...`);
    
    try {
      // 1. Validação dos dados do formulário
      console.log(`📝 [${requestId}] Validando dados do formulário...`);
      const validation = validateFormData(email, senha);
      
      if (!validation.isValid) {
        console.log(`❌ [${requestId}] Validação falhou:`, validation.errors);
        alert(`Erro de validação: ${validation.errors.join(', ')}`);
        return;
      }
      
      console.log(`✅ [${requestId}] Validação do formulário OK`);
      
      // 2. Teste de conectividade (opcional - pode ser comentado em produção)
      console.log(`🔍 [${requestId}] Testando conectividade...`);
      const connectivityTest = await testBackendConnectivity();
      setDiagnosticInfo(connectivityTest);
      
      if (connectivityTest.health === 'ERROR') {
        console.log(`❌ [${requestId}] Problema de conectividade detectado`);
        alert(`Problema de conectividade: ${connectivityTest.error}`);
        return;
      }
      
      console.log(`✅ [${requestId}] Conectividade OK`);
      
      // 3. Tentativa de login
      console.log(`🔐 [${requestId}] Enviando requisição de login...`);
      console.log(`📧 [${requestId}] Email:`, email);
      console.log(`🔑 [${requestId}] Senha:`, senha ? '***' : 'NÃO FORNECIDA');
      
      const res = await api.post('/auth/login', { 
        email, 
        password: senha 
      });
      
      console.log(`📥 [${requestId}] Resposta recebida:`, {
        status: res.status,
        hasToken: !!res.data?.token,
        hasUser: !!res.data?.user,
        userRole: res.data?.user?.role
      });
      
      // 4. Verifica se a resposta está correta antes de continuar
      if (res.data && res.data.token && res.data.user) {
        console.log(`✅ [${requestId}] Login bem-sucedido para usuário:`, res.data.user.email);
        console.log(`👤 [${requestId}] Role do usuário:`, res.data.user.role);
        
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Redireciona com base na role do usuário
        if (res.data.user.role === 'admin') {
          navigate('/admin/pedidos');
        } else if (res.data.user.role === 'waiter') {
          navigate('/garcom/mesas');
        } else {
          navigate('/new-features');
        }
      } else {
        // Caso a resposta não seja válida, exibe um erro
        console.log(`❌ [${requestId}] Resposta inválida do servidor:`, res.data);
        throw new Error('Resposta inválida do servidor');
      }
      
    } catch (err) {
      console.error(`❌ [${requestId}] Erro no login:`, err);
      logUI(err);
      
      // Log detalhado do erro
      if (err.response) {
        console.log(`📊 [${requestId}] Resposta de erro:`, {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        // Mensagens de erro específicas baseadas no status
        if (err.response.status === 401) {
          if (err.response.data?.message === 'Usuário não encontrado.') {
            alert('Usuário não encontrado. Verifique o email.');
          } else if (err.response.data?.message === 'Senha incorreta.') {
            alert('Senha incorreta. Tente novamente.');
          } else {
            alert('Credenciais inválidas.');
          }
        } else if (err.response.status === 400) {
          alert(`Erro de validação: ${err.response.data?.message}`);
        } else if (err.response.status === 500) {
          alert('Erro interno do servidor. Tente novamente.');
        } else {
          alert(`Erro ${err.response.status}: ${err.response.data?.message || 'Erro desconhecido'}`);
        }
      } else if (err.request) {
        console.log(`❌ [${requestId}] Requisição enviada mas sem resposta:`, err.request);
        alert('Sem resposta do servidor. Verifique a conectividade.');
      } else {
        console.log(`❌ [${requestId}] Erro na configuração da requisição:`, err.message);
        alert(`Erro de configuração: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@empresa.com"
              required
              className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="admin123"
              required
              className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-500"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded font-medium ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        {/* Botão de diagnóstico */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {showDiagnostic ? 'Ocultar' : 'Mostrar'} Diagnóstico
          </button>
        </div>
        
        {/* Informações de diagnóstico */}
        {showDiagnostic && diagnosticInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded text-xs">
            <h3 className="font-bold mb-2">🔍 Informações de Diagnóstico</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
              {JSON.stringify(diagnosticInfo, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Logs no console para debug */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Verifique o console do navegador para logs detalhados
        </div>
      </div>
    </div>
  );
}
