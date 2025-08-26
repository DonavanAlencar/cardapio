const mysql = require('mysql2/promise');

// Teste de diferentes configurações de conexão
const testConfigs = [
  { host: 'localhost', user: 'root', password: '', database: 'cardapio' },
  { host: 'localhost', user: 'root', password: 'root', database: 'cardapio' },
  { host: 'localhost', user: 'root', password: 'password', database: 'cardapio' },
  { host: 'localhost', user: 'root', password: 'admin', database: 'cardapio' },
  { host: '127.0.0.1', user: 'root', password: '', database: 'cardapio' },
  { host: '127.0.0.1', user: 'root', password: 'root', database: 'cardapio' },
  { host: '127.0.0.1', user: 'root', password: 'password', database: 'cardapio' },
  { host: '127.0.0.1', user: 'root', password: 'admin', database: 'cardapio' },
];

async function testConnection(config) {
  try {
    console.log(`\n🧪 Testando: ${config.host}:${config.user}:${config.password ? '***' : 'sem senha'}`);
    
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
    
    console.log(`✅ SUCESSO! Conectado com:`, {
      host: config.host,
      user: config.user,
      password: config.password ? '***' : 'sem senha',
      result: rows[0]
    });
    
    // Testa se o banco 'cardapio' existe
    try {
      const [databases] = await connection.execute('SHOW DATABASES');
      const dbExists = databases.some(db => db.Database === 'cardapio');
      console.log(`📊 Banco 'cardapio' existe: ${dbExists ? 'SIM' : 'NÃO'}`);
      
      if (dbExists) {
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tabelas encontradas: ${tables.length}`);
      }
    } catch (dbError) {
      console.log(`⚠️ Erro ao verificar banco: ${dbError.message}`);
    }
    
    await connection.end();
    return config;
    
  } catch (error) {
    console.log(`❌ FALHOU: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🔍 Testando conexões MySQL...\n');
  
  let workingConfig = null;
  
  for (const config of testConfigs) {
    const result = await testConnection(config);
    if (result && !workingConfig) {
      workingConfig = result;
    }
  }
  
  if (workingConfig) {
    console.log('\n🎉 CONFIGURAÇÃO FUNCIONANDO ENCONTRADA!');
    console.log('📝 Atualize seu arquivo .env com:');
    console.log(`DB_HOST=${workingConfig.host}`);
    console.log(`DB_USER=${workingConfig.user}`);
    console.log(`DB_PASSWORD=${workingConfig.password || ''}`);
    console.log(`DB_NAME=${workingConfig.database}`);
    
    // Testa a configuração atual do .env
    console.log('\n🔧 Testando configuração atual do .env...');
    require('dotenv').config();
    
    try {
      const currentConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      };
      
      const connection = await mysql.createConnection(currentConfig);
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ Configuração atual do .env FUNCIONA!');
      await connection.end();
      
    } catch (error) {
      console.log('❌ Configuração atual do .env NÃO FUNCIONA:', error.message);
    }
    
  } else {
    console.log('\n💥 NENHUMA CONFIGURAÇÃO FUNCIONOU!');
    console.log('🔧 Possíveis soluções:');
    console.log('1. Verificar se MySQL está rodando');
    console.log('2. Verificar se usuário root tem acesso');
    console.log('3. Verificar se banco cardapio existe');
    console.log('4. Resetar senha do MySQL');
  }
}

main().catch(console.error);
