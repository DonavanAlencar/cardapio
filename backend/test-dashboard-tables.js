// Teste para verificar a estrutura dos dados das mesas do dashboard
const mysql = require('mysql2/promise');

async function testDashboardTables() {
  try {
    // Configuração da conexão com o banco (MySQL Docker)
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'cardapio',
      port: 3306
    });

    console.log('✅ Conectado ao banco de dados');

    // Query similar à do dashboard
    const [tablesResult] = await connection.query(
      `SELECT 
        t.id, 
        t.table_number, 
        t.capacity, 
        t.status,
        COALESCE(o.id, 0) as has_order, 
        COALESCE(o.total_amount, 0) as order_total,
        COALESCE(r.id, 0) as has_reservation,
        COALESCE(r.reservation_time, '') as reservation_time,
        COALESCE(r.duration_minutes, 0) as duration_minutes,
        COALESCE(r.status, '') as reservation_status,
        COALESCE(c.full_name, '') as customer_name
      FROM tables t 
      LEFT JOIN orders o ON t.id = o.table_id AND o.status IN ("open", "in_preparation", "ready")
      LEFT JOIN table_reservations r ON t.id = r.table_id AND r.status IN ("booked", "seated")
      LEFT JOIN customers c ON r.customer_id = c.id
      ORDER BY t.table_number`
    );

    console.log('\n📋 Dados brutos das mesas:');
    console.log(JSON.stringify(tablesResult, null, 2));

    // Mapeamento como no dashboard
    const mappedTables = tablesResult.map(table => ({
      id: table.id,
      number: table.table_number,
      capacity: table.capacity,
      status: table.status,
      hasOrder: table.has_order > 0,
      orderTotal: parseFloat(table.order_total).toFixed(2),
      hasReservation: table.has_reservation > 0,
      reservationTime: table.reservation_time,
      durationMinutes: table.duration_minutes,
      reservationStatus: table.reservation_status,
      customerName: table.customer_name
    }));

    console.log('\n🔄 Dados mapeados das mesas:');
    console.log(JSON.stringify(mappedTables, null, 2));

    // Verificar se table_number está sendo mapeado corretamente para number
    console.log('\n🔍 Verificação do mapeamento:');
    mappedTables.forEach(table => {
      console.log(`Mesa ID ${table.id}:`);
      console.log(`  - table_number (banco): "${table.number}"`);
      console.log(`  - number (mapeado): "${table.number}"`);
      console.log(`  - Status: ${table.status}`);
      console.log(`  - Tem pedido: ${table.hasOrder}`);
      console.log(`  - Tem reserva: ${table.hasReservation}`);
      console.log('');
    });

    await connection.end();
    console.log('✅ Teste concluído');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar o teste
testDashboardTables();
