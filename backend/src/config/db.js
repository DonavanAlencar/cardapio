const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20, // Aumentar limite de conexões
  queueLimit: 100, // Limitar fila de conexões
  charset: 'utf8mb4'
});

// Testar conexão na inicialização
pool.getConnection()
  .then(connection => {
    console.log('✅ [DB] Conexão com banco estabelecida com sucesso');
    connection.release();
  })
  .catch(err => {
    console.error('❌ [DB] Erro ao conectar com banco:', err.message);
  });

module.exports = pool;