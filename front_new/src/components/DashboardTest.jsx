import { useState, useEffect } from 'react';

export default function DashboardTest() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testDashboardAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:4000/api/dashboard/test');
      const data = await response.json();
      
      if (response.ok) {
        setTestResult(data);
      } else {
        setError(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      setError(`Erro de conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Teste da API Dashboard</h2>
      
      <button 
        onClick={testDashboardAPI}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testando...' : 'Testar API Dashboard'}
      </button>

      {loading && (
        <div style={{ marginTop: '20px', color: '#6b7280' }}>
          Testando conexão com a API...
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '5px',
          color: '#dc2626'
        }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      {testResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0',
          borderRadius: '5px',
          color: '#166534'
        }}>
          <h3>✅ Teste bem-sucedido!</h3>
          <pre style={{ 
            backgroundColor: '#f8fafc', 
            padding: '10px', 
            borderRadius: '3px',
            overflow: 'auto'
          }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#6b7280' }}>
        <h4>Instruções:</h4>
        <ol>
          <li>Certifique-se de que o backend está rodando na porta 4000</li>
          <li>Clique no botão "Testar API Dashboard"</li>
          <li>Se houver erro, verifique o console do navegador e do backend</li>
        </ol>
      </div>
    </div>
  );
}
