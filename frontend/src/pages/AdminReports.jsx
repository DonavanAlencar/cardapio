import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminReports = () => {
  const [dailySales, setDailySales] = useState([]);
  const [ingredientConsumption, setIngredientConsumption] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const salesResponse = await api.get('/api/reports/daily-sales');
      setDailySales(salesResponse.data);

      const consumptionResponse = await api.get('/api/reports/ingredient-consumption');
      setIngredientConsumption(consumptionResponse.data);

      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar relatórios:', err);
      setError('Erro ao carregar relatórios.');
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Carregando relatórios...</div>;
  if (error) return <div className="p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relatórios</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Vendas do Dia</h2>
        {dailySales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Data</th>
                  <th className="py-2 px-4 border-b">Método de Pagamento</th>
                  <th className="py-2 px-4 border-b">Total Vendido</th>
                </tr>
              </thead>
              <tbody>
                {dailySales.map((sale, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{new Date(sale.sale_date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{sale.payment_method}</td>
                    <td className="py-2 px-4 border-b">R$ {parseFloat(sale.total_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Nenhuma venda registrada para hoje.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Consumo de Insumos (Hoje)</h2>
        {ingredientConsumption.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Ingrediente</th>
                  <th className="py-2 px-4 border-b">Unidade</th>
                  <th className="py-2 px-4 border-b">Total Consumido</th>
                </tr>
              </thead>
              <tbody>
                {ingredientConsumption.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{item.ingredient_name}</td>
                    <td className="py-2 px-4 border-b">{item.unidade_medida}</td>
                    <td className="py-2 px-4 border-b">{parseFloat(item.total_consumed).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Nenhum consumo de insumos registrado para hoje.</p>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
