'use client';

import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface DailyChartProps {
  data: Array<{
    date: string;
    total: number;
  }>;
  budgetAmount?: number;
}

function DailyChartComponent({ data, budgetAmount = 0 }: DailyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50">
        <p className="text-sm text-slate-500">Tidak ada data pengeluaran harian</p>
      </div>
    );
  }

  const dailyBudget = budgetAmount > 0 ? Math.round(budgetAmount / 30) : 0;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 mt-5 mb-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Pengeluaran Harian</h3>
        {dailyBudget > 0 && (
          <span className="text-xs font-medium text-slate-600">
            Budget Harian: {formatCurrency(dailyBudget)}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: '600px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis 
                stroke="#94a3b8"
                domain={dailyBudget > 0 ? [0, dailyBudget * 1.2] : [0, 'auto']}
                type="number"
              />
              {dailyBudget > 0 && (
                <ReferenceLine
                  y={dailyBudget}
                  stroke="#f97316"
                  strokeDasharray="5 5"
                  label={{ value: 'Budget Harian', position: 'right', fill: '#f97316', fontSize: 12 }}
                />
              )}
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 5 }}
                activeDot={{ r: 7 }}
                name="Total Pengeluaran"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default memo(DailyChartComponent);
