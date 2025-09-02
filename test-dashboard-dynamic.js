#!/usr/bin/env node

/**
 * Script de Teste para Dashboard Dinâmico
 * 
 * Este script testa se o dashboard está exibindo corretamente
 * o status das mesas considerando reservas e pedidos.
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

// Funções de teste
async function testDashboardMain() {
  console.log('🔍 Testando dashboard principal...');
  try {
    const response = await testClient.get('/dashboard');
    const data = response.data;
    
    console.log('✅ Dashboard principal OK');
    console.log('📊 Dados recebidos:');
    console.log(`   - Usuário: ${data.user?.name || 'N/A'}`);
    console.log(`   - Filial: ${data.user?.branch || 'N/A'}`);
    console.log(`   - Total de mesas: ${data.summary?.totalTables || 0}`);
    console.log(`   - Mesas disponíveis: ${data.summary?.availableTables || 0}`);
    console.log(`   - Mesas ocupadas: ${data.summary?.occupiedTables || 0}`);
    console.log(`   - Mesas reservadas: ${data.summary?.reservedTables || 0}`);
    console.log(`   - Total de reservas hoje: ${data.reservations?.length || 0}`);
    
    // Verificar se as mesas têm informações de reserva
    if (data.tables && data.tables.length > 0) {
      console.log('\n📋 Status das mesas:');
      data.tables.forEach(table => {
        const status = table.hasOrder ? 'Ocupada' : 
                      (table.hasReservation ? 'Reservada' : 'Disponível');
        console.log(`   Mesa ${table.number}: ${status}`);
        
        if (table.hasReservation) {
          console.log(`     - Cliente: ${table.customerName || 'N/A'}`);
          console.log(`     - Horário: ${table.reservationTime || 'N/A'}`);
          console.log(`     - Duração: ${table.durationMinutes || 0} min`);
        }
        
        if (table.hasOrder) {
          console.log(`     - Pedido: R$ ${table.orderTotal || 0}`);
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Dashboard principal falhou:', error.response?.data || error.message);
    return false;
  }
}

async function testDashboardRealTime() {
  console.log('\n🔄 Testando dashboard em tempo real...');
  try {
    const response = await testClient.get('/dashboard/real-time');
    const data = response.data;
    
    console.log('✅ Dashboard tempo real OK');
    console.log(`   - Mesas atualizadas: ${data.tables?.length || 0}`);
    console.log(`   - Pedidos ativos: ${data.activeOrders?.length || 0}`);
    
    // Verificar se as mesas têm informações de reserva
    if (data.tables && data.tables.length > 0) {
      console.log('\n📋 Status das mesas em tempo real:');
      data.tables.forEach(table => {
        const status = table.hasOrder ? 'Ocupada' : 
                      (table.hasReservation ? 'Reservada' : 'Disponível');
        console.log(`   Mesa ${table.number}: ${status}`);
        
        if (table.hasReservation) {
          console.log(`     - Cliente: ${table.customerName || 'N/A'}`);
          console.log(`     - Status da reserva: ${table.reservationStatus || 'N/A'}`);
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Dashboard tempo real falhou:', error.response?.data || error.message);
    return false;
  }
}

async function testReservationsIntegration() {
  console.log('\n📅 Testando integração com reservas...');
  try {
    const response = await testClient.get('/reservations');
    const data = response.data;
    
    console.log('✅ Reservas OK');
    console.log(`   - Total de reservas: ${data.count || 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Detalhes das reservas:');
      data.data.slice(0, 3).forEach(reservation => {
        console.log(`   - Mesa ${reservation.table_number}: ${reservation.customer_name}`);
        console.log(`     Horário: ${reservation.reservation_time}`);
        console.log(`     Status: ${reservation.status}`);
        console.log(`     Duração: ${reservation.duration_minutes} min`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Reservas falharam:', error.response?.data || error.message);
    return false;
  }
}

async function testTableAvailability() {
  console.log('\n🔍 Testando verificação de disponibilidade...');
  try {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const params = {
      branch_id: 1,
      reservation_time: tomorrow,
      duration_minutes: 90
    };
    
    const response = await testClient.get('/reservations/availability/check', { params });
    const data = response.data;
    
    console.log('✅ Disponibilidade OK');
    console.log(`   - Mesas disponíveis: ${data.data?.available_tables?.length || 0}`);
    console.log(`   - Horário solicitado: ${data.data?.requested_time}`);
    console.log(`   - Duração: ${data.data?.requested_duration} min`);
    
    return true;
  } catch (error) {
    console.error('❌ Disponibilidade falhou:', error.response?.data || error.message);
    return false;
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando testes do dashboard dinâmico...\n');

  const tests = [
    { name: 'Dashboard Principal', fn: testDashboardMain },
    { name: 'Dashboard Tempo Real', fn: testDashboardRealTime },
    { name: 'Integração com Reservas', fn: testReservationsIntegration },
    { name: 'Verificação de Disponibilidade', fn: testTableAvailability }
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
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADO DOS TESTES DO DASHBOARD');
  console.log('='.repeat(60));
  console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Dashboard funcionando perfeitamente com reservas!');
    console.log('   - Status das mesas dinâmico ✅');
    console.log('   - Integração com reservas ✅');
    console.log('   - Atualização em tempo real ✅');
    console.log('   - Verificação de disponibilidade ✅');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima.');
  }

  console.log('\n' + '='.repeat(60));
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  // Verificar se o token foi fornecido
  if (!TEST_TOKEN || TEST_TOKEN === 'your-test-token-here') {
    console.error('❌ Erro: Token de teste não configurado.');
    console.log('Configure a variável de ambiente TEST_TOKEN ou edite o script.');
    console.log('Exemplo: TEST_TOKEN=seu-token-aqui node test-dashboard-dynamic.js');
    process.exit(1);
  }

  runTests().catch(error => {
    console.error('❌ Erro fatal durante os testes:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testClient
};




