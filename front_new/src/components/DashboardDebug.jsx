import { useState } from 'react';

export default function DashboardDebug() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testEndpoints = async () => {
    setLoading(true);
    setError(null);
    setTestResults({});
    
    const endpoints = [
      { name: 'Teste Básico', url: 'http://localhost:4000/api/dashboard/test' },
      { name: 'Debug Detalhado', url: 'http://localhost:4000/api/dashboard/debug' },
      { name: 'Health Check', url: 'http://localhost:4000/api/health' },
      { name: 'Diagnóstico', url: 'http://localhost:4000/api/diagnostic' }
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 Testando: ${endpoint.name} - ${endpoint.url}`);
        
        const response = await fetch(endpoint.url);
        const data = await response.json();
        
        results[endpoint.name] = {
          status: response.status,
          ok: response.ok,
          data: data,
          timestamp: new Date().toISOString()
        };
        
        console.log(`✅ ${endpoint.name}:`, data);
      } catch (err) {
        results[endpoint.name] = {
          status: 'ERROR',
          ok: false,
          error: err.message,
          timestamp: new Date().toISOString()
        };
        
        console.error(`❌ ${endpoint.name}:`, err);
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  const testWithAuth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Tentar acessar o dashboard com autenticação
      const token = localStorage.getItem('token');
      console.log('🔑 Token encontrado:', token ? 'Sim' : 'Não');
      
      if (!token) {
        setError('Nenhum token de autenticação encontrado no localStorage');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:4000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      setTestResults({
        'Dashboard com Auth': {
          status: response.status,
          ok: response.ok,
          data: data,
          timestamp: new Date().toISOString()
        }
      });

      if (!response.ok) {
        setError(`Erro ${response.status}: ${data.error || 'Erro desconhecido'}`);
      }
      
    } catch (err) {
      setError(`Erro de conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔍 Debug do Dashboard - Diagnóstico Completo</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testEndpoints}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Testando...' : '🧪 Testar Endpoints'}
        </button>

        <button 
          onClick={testWithAuth}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testando...' : '🔑 Testar com Auth'}
        </button>
      </div>

      {loading && (
        <div style={{ marginBottom: '20px', color: '#6b7280' }}>
          ⏳ Executando testes...
        </div>
      )}

      {error && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '5px',
          color: '#dc2626'
        }}>
          <strong>❌ Erro:</strong> {error}
        </div>
      )}

      {Object.keys(testResults).length > 0 && (
        <div>
          <h3>📊 Resultados dos Testes</h3>
          {Object.entries(testResults).map(([name, result]) => (
            <div key={name} style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              backgroundColor: result.ok ? '#f0fdf4' : '#fef2f2', 
              border: `1px solid ${result.ok ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '5px'
            }}>
              <h4 style={{ 
                color: result.ok ? '#166534' : '#dc2626',
                margin: '0 0 10px 0'
              }}>
                {result.ok ? '✅' : '❌'} {name}
              </h4>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Status:</strong> {result.status} | 
                <strong>Sucesso:</strong> {result.ok ? 'Sim' : 'Não'} | 
                <strong>Timestamp:</strong> {result.timestamp}
              </div>

              {result.error ? (
                <div style={{ color: '#dc2626' }}>
                  <strong>Erro:</strong> {result.error}
                </div>
              ) : (
                <details>
                  <summary style={{ cursor: 'pointer', color: '#6b7280' }}>
                    Ver dados da resposta
                  </summary>
                  <pre style={{ 
                    backgroundColor: '#f8fafc', 
                    padding: '10px', 
                    borderRadius: '3px',
                    overflow: 'auto',
                    marginTop: '10px',
                    fontSize: '12px'
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#6b7280' }}>
        <h4>📋 Instruções de Debug:</h4>
        <ol>
          <li><strong>Testar Endpoints:</strong> Verifica se as APIs básicas estão funcionando</li>
          <li><strong>Testar com Auth:</strong> Verifica se o dashboard funciona com autenticação</li>
          <li>Verifique o console do navegador para logs detalhados</li>
          <li>Verifique o console do backend para logs de erro</li>
        </ol>
        
        <h4>🔧 Possíveis Problemas:</h4>
        <ul>
          <li><strong>Backend não está rodando</strong> - Verifique se está na porta 4000</li>
          <li><strong>Banco de dados não conecta</strong> - Verifique as variáveis de ambiente</li>
          <li><strong>Token inválido/expirado</strong> - Faça login novamente</li>
          <li><strong>Erro nas consultas SQL</strong> - Verifique a estrutura das tabelas</li>
        </ul>
      </div>
    </div>
  );
}
