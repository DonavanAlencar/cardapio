const axios = require('axios');

// Testar as APIs de contagem
async function testAPIs() {
  try {
    console.log('🧪 Testando APIs...');
    
    // 1. Testar login
    console.log('1. Fazendo login...');
    const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login bem-sucedido, token obtido');
    
    // 2. Testar API da cozinha
    console.log('2. Testando API da cozinha...');
    const kitchenRes = await axios.get('http://localhost:4000/api/kitchen/pending-count', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ API da cozinha:', kitchenRes.data);
    
    // 3. Testar API de pedidos
    console.log('3. Testando API de pedidos...');
    const ordersRes = await axios.get('http://localhost:4000/api/orders/pending-count', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ API de pedidos:', ordersRes.data);
    
    // 4. Verificar dados no banco
    console.log('4. Verificando dados no banco...');
    
    // Verificar pedidos com status 'open'
    const ordersCheck = await axios.get('http://localhost:4000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const openOrders = ordersCheck.data.filter(order => order.status === 'open');
    console.log(`📊 Pedidos abertos encontrados: ${openOrders.length}`);
    openOrders.forEach(order => {
      console.log(`   - Pedido ${order.id}: ${order.status} (${order.created_at})`);
    });
    
    // Verificar kitchen tickets
    const kitchenCheck = await axios.get('http://localhost:4000/api/kitchen/tickets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const pendingItems = kitchenCheck.data.filter(item => 
      item.preparation_status === 'pending' || item.preparation_status === 'preparing'
    );
    console.log(`👨‍🍳 Itens pendentes da cozinha: ${pendingItems.length}`);
    pendingItems.forEach(item => {
      console.log(`   - Item ${item.ticket_item_id}: ${item.preparation_status} (${item.product_name})`);
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testAPIs();
