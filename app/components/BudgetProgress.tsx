'use client';

import { memo } from 'react';
import { formatCurrency } from '@/lib/format';

interface BudgetProgressProps {
  spent: number;
  total: number;
  onSetBudget?: () => void;
}

function BudgetProgressComponent({ spent, total, onSetBudget }: BudgetProgressProps) {
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const remaining = total - spent;
  const isOverBudget = spent > total;

  const getProgressBarStyle = () => {
    if (percentage >= 100) {
      return { background: 'linear-gradient(to right, #eab308, #dc2626)' };
    }
    if (percentage >= 80) {
      return { background: 'linear-gradient(to right, #10b981, #eab308)' };
    }
    return { backgroundColor: '#10b981' };
  };

  const getStatusText = () => {
    if (isOverBudget) {
      return `Melebihi budget sebesar ${formatCurrency(spent - total)}`;
    }
    return `Sisa budget ${formatCurrency(remaining)}`;
  };

  if (total === 0) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5 ring-1 ring-indigo-100 mb-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Budget Bulanan</p>
            <p className="mt-1 text-lg font-bold text-slate-900">Belum diatur</p>
          </div>
          {onSetBudget && (
            <button
              onClick={onSetBudget}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Atur Budget
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 mt-4 mb-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">Budget Bulanan</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(total)}</p>
          <p
            className={`mt-1 text-xs font-medium ${
              isOverBudget ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {getStatusText()}
          </p>
        </div>
        {onSetBudget && (
          <button
            onClick={onSetBudget}
            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Edit
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">
            {formatCurrency(spent)} / {formatCurrency(total)}
          </span>
          <span className="font-semibold text-slate-800">{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              ...getProgressBarStyle(),
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(BudgetProgressComponent);
