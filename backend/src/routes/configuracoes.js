const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth('admin'));

// Função para garantir que a tabela de configurações existe
async function ensureConfigTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id bigint unsigned NOT NULL AUTO_INCREMENT,
        percentual_comissao decimal(5,2) NOT NULL DEFAULT '10.00',
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    // Inserir configuração padrão se não existir
    await pool.query(`
      INSERT INTO configuracoes (id, percentual_comissao) 
      VALUES (1, 10.00) 
      ON DUPLICATE KEY UPDATE percentual_comissao = VALUES(percentual_comissao)
    `);
  } catch (err) {
    console.error('Erro ao criar tabela de configurações:', err);
  }
}

// Obter configuração de comissão
router.get('/comissao', async (req, res) => {
  try {
    await ensureConfigTable();
    const [[cfg]] = await pool.query('SELECT percentual_comissao FROM configuracoes LIMIT 1');
    res.json({ percentual: cfg.percentual_comissao });
  } catch (err) {
    console.error('Erro ao obter configuração de comissão:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar comissão global
router.put('/comissao', async (req, res) => {
  try {
    await ensureConfigTable();
    const { percentual } = req.body;
    await pool.query('UPDATE configuracoes SET percentual_comissao = ? WHERE id = 1', [percentual]);
    res.json({ percentual });
  } catch (err) {
    console.error('Erro ao atualizar configuração de comissão:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;