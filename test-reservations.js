#!/usr/bin/env node

/**
 * Script de Teste para Sistema de Reservas
 * 
 * Este script testa as principais funcionalidades do sistema de reservas
 * incluindo criação, listagem, atualização e cancelamento.
 */

const axios = require('axios');

// Configuração
const BASE_URL = 'http://localhost:4000/api';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-test-token-here';

// Cliente de teste
const testClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Dados de teste
const testReservation = {
  customer_id: 1,
  table_id: 1,
  reservation_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
  duration_minutes: 90,
  buffer_after_minutes: 10,
  notes: 'Reserva de teste criada pelo script'
};

let createdReservationId = null;

// Funções de teste
async function testHealthCheck() {
  console.log('🔍 Testando health check...');
  try {
    const response = await testClient.get('/health');
    console.log('✅ Health check OK:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check falhou:', error.message);
    return false;
  }
}

async function testListReservations() {
  console.log('\n📋 Testando listagem de reservas...');
  try {
    const response = await testClient.get('/reservations');
    console.log('✅ Listagem OK:', {
      count: response.data.count,
      data: response.data.data.length
    });
    return true;
  } catch (error) {
    console.error('❌ Listagem falhou:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateReservation() {
  console.log('\n➕ Testando criação de reserva...');
  try {
    const response = await testClient.post('/reservations', testReservation);
    console.log('✅ Criação OK:', {
      id: response.data.data.id,
      message: response.data.message
    });
    createdReservationId = response.data.data.id;
    return true;
  } catch (error) {
    console.error('❌ Criação falhou:', error.response?.data || error.message);
    return false;
  }
}

async function testGetReservation() {
  if (!createdReservationId) {
    console.log('⚠️  Pulando teste de busca - reserva não criada');
    return false;
  }

  console.log('\n🔍 Testando busca de reserva...');
  try {
    const response = await testClient.get(`/reservations/${createdReservationId}`);
    console.log('✅ Busca OK:', {
      id: response.data.data.id,
      customer: response.data.data.customer_name,
      table: response.data.data.table_number
    });
    return true;
  } catch (error) {
    console.error('❌ Busca falhou:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdateReservation() {
  if (!createdReservationId) {
    console.log('⚠️  Pulando teste de atualização - reserva não criada');
    return false;
  }

  console.log('\n✏️  Testando atualização de reserva...');
  try {
    const updateData = {
      ...testReservation,
      duration_minutes: 120,
      notes: 'Reserva atualizada pelo script de teste'
    };

    const response = await testClient.put(`/reservations/${createdReservationId}`, updateData);
    console.log('✅ Atualização OK:', {
      id: response.data.data.id,
      message: response.data.message,
      duration: response.data.data.duration_minutes
    });
    return true;
  } catch (error) {
    console.error('❌ Atualização falhou:', error.response?.data || error.message);
    return false;
  }
}

async function testCheckAvailability() {
  console.log('\n🔍 Testando verificação de disponibilidade...');
  try {
    const params = {
      branch_id: 1,
      reservation_time: testReservation.reservation_time,
      duration_minutes: 90
    };

    const response = await testClient.get('/reservations/availability/check', { params });
    console.log('✅ Disponibilidade OK:', {
      available_tables: response.data.data.available_tables.length,
      requested_time: response.data.data.requested_time
    });
    return true;
  } catch (error) {
    console.error('❌ Disponibilidade falhou:', error.response?.data || error.message);
    return false;
  }
}

async function testGetReservationStats() {
  console.log('\n📊 Testando estatísticas de reservas...');
  try {
    const response = await testClient.get('/reservations/stats/summary');
    console.log('✅ Estatísticas OK:', {
      total: response.data.data.total,
      by_status: response.data.data.by_status.length,
      by_hour: response.data.data.by_hour.length
    });
    return true;
  } catch (error) {
    console.error('❌ Estatísticas falharam:', error.response?.data || error.message);
    return false;
  }
}

async function testCancelReservation() {
  if (!createdReservationId) {
    console.log('⚠️  Pulando teste de cancelamento - reserva não criada');
    return false;
  }

  console.log('\n❌ Testando cancelamento de reserva...');
  try {
    const response = await testClient.delete(`/reservations/${createdReservationId}`);
    console.log('✅ Cancelamento OK:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Cancelamento falhou:', error.response?.data || error.message);
    return false;
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando testes do sistema de reservas...\n');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Listar Reservas', fn: testListReservations },
    { name: 'Criar Reserva', fn: testCreateReservation },
    { name: 'Buscar Reserva', fn: testGetReservation },
    { name: 'Atualizar Reserva', fn: testUpdateReservation },
    { name: 'Verificar Disponibilidade', fn: testCheckAvailability },
    { name: 'Estatísticas', fn: testGetReservationStats },
    { name: 'Cancelar Reserva', fn: testCancelReservation }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passedTests++;
    } catch (error) {
      console.error(`❌ Erro inesperado no teste ${test.name}:`, error.message);
    }
  }

  // Resultado final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESULTADO DOS TESTES');
  console.log('='.repeat(50));
  console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Todos os testes passaram! Sistema funcionando perfeitamente.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima.');
  }

  console.log('\n' + '='.repeat(50));
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  // Verificar se o token foi fornecido
  if (!TEST_TOKEN || TEST_TOKEN === 'your-test-token-here') {
    console.error('❌ Erro: Token de teste não configurado.');
    console.log('Configure a variável de ambiente TEST_TOKEN ou edite o script.');
    console.log('Exemplo: TEST_TOKEN=seu-token-aqui node test-reservations.js');
    process.exit(1);
  }

  runTests().catch(error => {
    console.error('❌ Erro fatal durante os testes:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testClient,
  testReservation
};
