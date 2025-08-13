import React, { useEffect, useState } from 'react';
import api from '../services/api';

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  background: '#fff',
  boxShadow: '0 2px 8px #0001',
};

export default function AdminReports() {
  const [dailySales, setDailySales] = useState(null);
  const [ingredientConsumption, setIngredientConsumption] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [salesRes, consRes, stockRes] = await Promise.all([
          api.get('/reports/daily-sales'),
api.get('/reports/ingredient-consumption'),
api.get('/reports/low-stock'),
        ]);
        setDailySales(salesRes.data);
        setIngredientConsumption(consRes.data);
        setLowStock(stockRes.data);
      } catch (err) {
        setDailySales(null);
        setIngredientConsumption([]);
        setLowStock([]);
      }
      setLoading(false);
    };
    fetchReports();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard / Relatórios</h1>
      {loading && <div>Carregando...</div>}
      {!loading && (
        <>
          <div style={cardStyle}>
            <h2 className="text-xl font-semibold mb-2">Vendas do Dia</h2>
            <div><b>Data:</b> {dailySales?.dia || '-'}</div>
            <div><b>Total de Vendas:</b> R$ {dailySales?.total_vendas ? Number(dailySales.total_vendas).toFixed(2) : '0.00'}</div>
            <div><b>Pedidos Fechados:</b> {dailySales?.pedidos || 0}</div>
          </div>

          <div style={cardStyle}>
            <h2 className="text-xl font-semibold mb-2">Consumo de Insumos (Hoje)</h2>
            {ingredientConsumption.length === 0 && <div>Nenhum consumo registrado hoje.</div>}
            {ingredientConsumption.length > 0 && (
              <table className="min-w-full text-xs sm:text-sm">
                <thead>
                  <tr>
                    <th className="py-1 px-2">Ingrediente</th>
                    <th className="py-1 px-2">Total Consumido</th>
                    <th className="py-1 px-2">Unidade</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredientConsumption.map((row, i) => (
                    <tr key={i}>
                      <td className="py-1 px-2">{row.nome}</td>
                      <td className="py-1 px-2">{Number(row.total_consumido).toFixed(2)}</td>
                      <td className="py-1 px-2">{row.unidade_medida}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={cardStyle}>
            <h2 className="text-xl font-semibold mb-2">Alertas de Estoque Baixo</h2>
            {lowStock.length === 0 && <div>Nenhum ingrediente abaixo do mínimo.</div>}
            {lowStock.length > 0 && (
              <table className="min-w-full text-xs sm:text-sm">
                <thead>
                  <tr>
                    <th className="py-1 px-2">Ingrediente</th>
                    <th className="py-1 px-2">Estoque</th>
                    <th className="py-1 px-2">Mínimo</th>
                    <th className="py-1 px-2">Unidade</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((row, i) => (
                    <tr key={i}>
                      <td className="py-1 px-2">{row.nome}</td>
                      <td className="py-1 px-2">{Number(row.quantidade_estoque).toFixed(2)}</td>
                      <td className="py-1 px-2">{Number(row.quantidade_minima).toFixed(2)}</td>
                      <td className="py-1 px-2">{row.unidade_medida}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
