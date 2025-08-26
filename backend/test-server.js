#!/usr/bin/env node

// Script para testar se o servidor está funcionando
const http = require('http');

console.log('🧪 Teste do Servidor Backend - Cardápio');
console.log('=======================================');

// Teste 1: Verificar se o servidor está rodando
async function testServer() {
  console.log('\n🚀 Testando se o servidor está rodando...');
  
  const tests = [
    {
      name: 'Health Check',
      path: '/api/health',
      expected: 'OK'
    },
    {
      name: 'Dashboard Test',
      path: '/api/dashboard-test',
      expected: 'Dashboard test endpoint funcionando'
    },
    {
      name: 'Dashboard Simple Test',
      path: '/api/dashboard/simple-test',
      expected: 'Dashboard Simple Test - OK'
    },
    {
      name: 'Auth Test DB',
      path: '/api/auth/test-db',
      expected: 'success'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testando: ${test.name}`);
      console.log(`   URL: http://localhost:4000${test.path}`);
      
      const result = await makeRequest(test.path);
      
      if (result.success) {
        console.log(`   ✅ Status: ${result.status}`);
        
        if (result.data && result.data.message) {
          console.log(`   📝 Resposta: ${result.data.message}`);
        }
        
        if (result.data && result.data.status) {
          console.log(`   📊 Status: ${result.data.status}`);
        }
        
        // Verificar se a resposta contém o texto esperado
        const responseText = JSON.stringify(result.data);
        if (responseText.includes(test.expected)) {
          console.log(`   ✅ Conteúdo esperado encontrado`);
        } else {
          console.log(`   ⚠️  Conteúdo diferente do esperado`);
        }
        
      } else {
        console.log(`   ❌ Falhou: ${result.error}`);
        if (result.data) {
          console.log(`   📋 Detalhes: ${JSON.stringify(result.data)}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
  }
}

async function makeRequest(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'GET',
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: data,
            error: 'Resposta não é JSON válido'
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        status: 'ERROR',
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        status: 'TIMEOUT',
        error: 'Timeout após 10 segundos'
      });
    });

    req.end();
  });
}

// Teste 2: Verificar se as rotas estão sendo registradas
async function testRoutes() {
  console.log('\n🔍 Testando se as rotas estão sendo registradas...');
  
  try {
    const result = await makeRequest('/api/dashboard-test');
    
    if (result.success && result.data.routes) {
      console.log('✅ Rotas disponíveis:');
      result.data.routes.forEach(route => {
        console.log(`   📍 ${route}`);
      });
    } else {
      console.log('❌ Não foi possível obter a lista de rotas');
    }
    
  } catch (error) {
    console.log(`❌ Erro ao testar rotas: ${error.message}`);
  }
}

// Executar testes
async function runAllTests() {
  try {
    await testServer();
    await testRoutes();
    
    console.log('\n🏁 Testes concluídos!');
    console.log('\n💡 Se todos os testes falharam, verifique:');
    console.log('   1. Se o backend está rodando: npm run dev');
    console.log('   2. Se está na porta 4000');
    console.log('   3. Se não há erros no console do backend');
    console.log('   4. Se o arquivo .env está configurado');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

runAllTests();
