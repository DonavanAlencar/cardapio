#!/usr/bin/env node

// Script de teste rápido para o backend
const http = require('http');

console.log('🧪 Teste Rápido do Backend - Cardápio');
console.log('=====================================');

const tests = [
  {
    name: 'Health Check',
    path: '/api/health',
    method: 'GET'
  },
  {
    name: 'Dashboard Simple Test',
    path: '/api/dashboard/simple-test',
    method: 'GET'
  },
  {
    name: 'Auth Test DB',
    path: '/api/auth/test-db',
    method: 'GET'
  }
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: test.path,
      method: test.method,
      timeout: 5000
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
            name: test.name,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData
          });
        } catch (e) {
          resolve({
            name: test.name,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: data,
            error: 'Resposta não é JSON válido'
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        name: test.name,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: test.name,
        status: 'TIMEOUT',
        success: false,
        error: 'Timeout após 5 segundos'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n🚀 Iniciando testes...\n');
  
  for (const test of tests) {
    console.log(`🧪 Testando: ${test.name}`);
    const result = await testEndpoint(test);
    
    if (result.success) {
      console.log(`✅ ${result.name}: OK (${result.status})`);
      if (result.data && result.data.message) {
        console.log(`   📝 ${result.data.message}`);
      }
    } else {
      console.log(`❌ ${result.name}: FALHOU`);
      console.log(`   🔍 Status: ${result.status}`);
      if (result.error) {
        console.log(`   ❌ Erro: ${result.error}`);
      }
      if (result.data && result.data.error) {
        console.log(`   📋 Detalhes: ${result.data.error}`);
      }
    }
    console.log('');
  }
  
  console.log('🏁 Testes concluídos!');
  
  // Verificar se o servidor está rodando
  console.log('\n📋 Resumo:');
  const allTests = tests.map(test => test.name);
  console.log(`   Endpoints testados: ${allTests.join(', ')}`);
  console.log('\n💡 Se todos os testes falharam, verifique:');
  console.log('   1. Se o backend está rodando (npm run dev)');
  console.log('   2. Se está na porta 4000');
  console.log('   3. Se o arquivo .env está configurado');
  console.log('   4. Se o MySQL está rodando');
}

// Executar testes
runTests().catch(console.error);
