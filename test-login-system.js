#!/usr/bin/env node

/**
 * Script de teste completo para o sistema de login
 * Testa todas as camadas: conectividade, banco de dados, autenticação
 */

const https = require('https');
const http = require('http');

// Configurações
const BASE_URL = 'https://food.546digitalservices.com';
const API_BASE = `${BASE_URL}/api`;

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🔍 ${title}`, 'bright');
  console.log('='.repeat(60));
}

function logTest(testName, result, details = '') {
  const status = result ? '✅ PASS' : '❌ FAIL';
  const color = result ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
}

// Função para fazer requisições HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Teste 1: Conectividade básica
async function testBasicConnectivity() {
  logSection('TESTE 1: Conectividade Básica');
  
  try {
    // Testa se o domínio responde
    const response = await makeRequest(BASE_URL);
    logTest('Domínio responde', response.status === 200, `Status: ${response.status}`);
    
    // Testa se o certificado SSL está funcionando
    logTest('HTTPS funcionando', response.status === 200, 'Conexão segura estabelecida');
    
    return response.status === 200;
  } catch (error) {
    logTest('Domínio responde', false, `Erro: ${error.message}`);
    return false;
  }
}

// Teste 2: Endpoints de saúde
async function testHealthEndpoints() {
  logSection('TESTE 2: Endpoints de Saúde');
  
  try {
    // Testa health check
    const healthResponse = await makeRequest(`${API_BASE}/health`);
    logTest('Health Check', healthResponse.status === 200, `Status: ${healthResponse.status}`);
    
    if (healthResponse.status === 200) {
      logTest('Health Check Response', healthResponse.data.status === 'OK', `Response: ${JSON.stringify(healthResponse.data)}`);
    }
    
    // Testa endpoint de diagnóstico
    const diagnosticResponse = await makeRequest(`${API_BASE}/diagnostic`);
    logTest('Diagnóstico', diagnosticResponse.status === 200, `Status: ${diagnosticResponse.status}`);
    
    if (diagnosticResponse.status === 200) {
      logTest('Banco de dados', diagnosticResponse.data.database?.status === 'connected', 
        `Status DB: ${diagnosticResponse.data.database?.status}`);
      logTest('Variáveis de ambiente', !!diagnosticResponse.data.environment?.JWT_SECRET, 
        `JWT_SECRET: ${diagnosticResponse.data.environment?.JWT_SECRET ? 'Definida' : 'Não definida'}`);
    }
    
    return healthResponse.status === 200 && diagnosticResponse.status === 200;
  } catch (error) {
    logTest('Endpoints de saúde', false, `Erro: ${error.message}`);
    return false;
  }
}

// Teste 3: Conectividade com banco de dados
async function testDatabaseConnectivity() {
  logSection('TESTE 3: Conectividade com Banco de Dados');
  
  try {
    const response = await makeRequest(`${API_BASE}/auth/test-db`);
    logTest('Endpoint de teste do banco', response.status === 200, `Status: ${response.status}`);
    
    if (response.status === 200) {
      logTest('Conexão com banco', response.data.database === 'connected', 
        `Status: ${response.data.database}`);
      logTest('Tabela users existe', response.data.usersTable === true, 
        `Tabela users: ${response.data.usersTable}`);
      logTest('Usuários no banco', response.data.userCount > 0, 
        `Total de usuários: ${response.data.userCount}`);
    }
    
    return response.status === 200;
  } catch (error) {
    logTest('Teste do banco', false, `Erro: ${error.message}`);
    return false;
  }
}

// Teste 4: Sistema de autenticação
async function testAuthenticationSystem() {
  logSection('TESTE 4: Sistema de Autenticação');
  
  try {
    // Testa login com usuário inexistente
    const invalidLoginResponse = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'usuario_inexistente@test.com',
        password: 'senha123'
      })
    });
    
    logTest('Login com usuário inexistente', invalidLoginResponse.status === 401, 
      `Status: ${invalidLoginResponse.status} - ${invalidLoginResponse.data?.message}`);
    
    // Testa login com dados inválidos (sem email)
    const invalidDataResponse = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: 'senha123'
      })
    });
    
    logTest('Login com dados inválidos', invalidDataResponse.status === 400, 
      `Status: ${invalidDataResponse.status} - ${invalidDataResponse.data?.message}`);
    
    // Testa login com credenciais válidas (se existirem)
    const validLoginResponse = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@empresa.com',
        password: 'admin123'
      })
    });
    
    if (validLoginResponse.status === 200) {
      logTest('Login com credenciais válidas', true, 
        `Usuário: ${validLoginResponse.data?.user?.email}, Role: ${validLoginResponse.data?.user?.role}`);
      logTest('Token JWT gerado', !!validLoginResponse.data?.token, 
        `Token: ${validLoginResponse.data?.token ? 'Sim' : 'Não'}`);
    } else if (validLoginResponse.status === 401) {
      logTest('Login com credenciais válidas', false, 
        `Usuário não encontrado ou senha incorreta: ${validLoginResponse.data?.message}`);
    } else {
      logTest('Login com credenciais válidas', false, 
        `Status inesperado: ${validLoginResponse.status}`);
    }
    
    return true;
  } catch (error) {
    logTest('Sistema de autenticação', false, `Erro: ${error.message}`);
    return false;
  }
}

// Teste 5: Performance e tempo de resposta
async function testPerformance() {
  logSection('TESTE 5: Performance e Tempo de Resposta');
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(`${API_BASE}/health`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    logTest('Tempo de resposta', responseTime < 1000, `Tempo: ${responseTime}ms`);
    
    if (responseTime < 500) {
      log('   🚀 Excelente performance!', 'green');
    } else if (responseTime < 1000) {
      log('   ⚡ Boa performance', 'yellow');
    } else {
      log('   🐌 Performance lenta', 'red');
    }
    
    return responseTime < 1000;
  } catch (error) {
    logTest('Performance', false, `Erro: ${error.message}`);
    return false;
  }
}

// Função principal
async function runAllTests() {
  log('🚀 INICIANDO TESTES COMPLETOS DO SISTEMA DE LOGIN', 'bright');
  log(`📍 URL Base: ${BASE_URL}`, 'cyan');
  log(`⏰ Timestamp: ${new Date().toISOString()}`, 'cyan');
  
  const results = {
    connectivity: await testBasicConnectivity(),
    health: await testHealthEndpoints(),
    database: await testDatabaseConnectivity(),
    authentication: await testAuthenticationSystem(),
    performance: await testPerformance()
  };
  
  // Resumo final
  logSection('RESUMO DOS TESTES');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const failedTests = totalTests - passedTests;
  
  log(`📊 Total de testes: ${totalTests}`, 'bright');
  log(`✅ Testes aprovados: ${passedTests}`, 'green');
  log(`❌ Testes falharam: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  
  if (failedTests === 0) {
    log('\n🎉 TODOS OS TESTES PASSARAM! O sistema está funcionando perfeitamente.', 'green');
  } else {
    log('\n⚠️  ALGUNS TESTES FALHARAM. Verifique os detalhes acima.', 'yellow');
  }
  
  // Recomendações baseadas nos resultados
  if (!results.connectivity) {
    log('\n🔧 RECOMENDAÇÕES:', 'yellow');
    log('   • Verifique se o domínio está configurado corretamente', 'yellow');
    log('   • Verifique se o DNS está resolvendo para o IP correto', 'yellow');
  }
  
  if (!results.database) {
    log('\n🔧 RECOMENDAÇÕES:', 'yellow');
    log('   • Verifique se o MySQL está rodando no Kubernetes', 'yellow');
    log('   • Verifique as variáveis de ambiente do banco', 'yellow');
    log('   • Verifique se as tabelas foram criadas corretamente', 'yellow');
  }
  
  if (!results.authentication) {
    log('\n🔧 RECOMENDAÇÕES:', 'yellow');
    log('   • Verifique se existem usuários no banco de dados', 'yellow');
    log('   • Verifique se a variável JWT_SECRET está definida', 'yellow');
    log('   • Verifique os logs do backend para erros específicos', 'yellow');
  }
}

// Executa os testes
runAllTests().catch(error => {
  log(`\n💥 ERRO CRÍTICO: ${error.message}`, 'red');
  process.exit(1);
});
