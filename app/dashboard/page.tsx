'use client';

import React, { useEffect, useState } from 'react';
import { getSalesMetrics } from '@/app/actions';
import { DollarSign, ShoppingCart, TrendingUp, Zap, BarChart3, Clock } from 'lucide-react';

interface MetricData {
  totalSalesCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  queryDuration: number;
  recentSales: Array<{
    id: string;
    amount: number;
    quantity: number;
    createdAt: Date;
    user: { name: string; email: string };
    product: { name: string };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      const metrics = await getSalesMetrics();
      setData(metrics);
      setLoading(false);
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium">Cargando métricas de PulseMarket...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PulseMarket Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">Dashboard de Analítica e-Commerce en Tiempo Real</p>
          </div>
          
          {/* Métrico SLA (<400ms) */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg text-emerald-700 text-sm font-semibold">
            <Zap className="h-4 w-4" />
            <span>Respuesta DB: {data.queryDuration}ms (SLA &lt; 400ms)</span>
          </div>
        </div>

        {/* Tarjetas de Métricas Clave */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Ingresos Totales</span>
              <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Total de Ventas</span>
              <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {data.totalSalesCount.toLocaleString()} órdenes
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Promedio por Orden</span>
              <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${data.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Tabla Paginada de Ventas Recientes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Últimas Transacciones (Set Masivo)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Cantidad</th>
                  <th className="py-3 px-4">Monto Total</th>
                  <th className="py-3 px-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{sale.user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{sale.product.name}</td>
                    <td className="py-3 px-4 text-gray-600">{sale.quantity} u.</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      ${sale.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}