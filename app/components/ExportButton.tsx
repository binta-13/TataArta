'use client';

import { memo } from 'react';
import { Download } from 'lucide-react';
import { exportMonthlyReport, exportDailyReport } from '@/lib/exportExcel';

interface ExportButtonProps {
  expenses: Array<{
    date: string;
    categoryId: string;
    description: string;
    amount: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  monthlyBudget: number;
  selectedDate: Date;
  isDaily?: boolean;
}

function ExportButtonComponent({
  expenses,
  categories,
  monthlyBudget,
  selectedDate,
  isDaily = false,
}: ExportButtonProps) {
  const handleExportMonthly = () => {
    const monthYear = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;

    const exportData = expenses
      .filter((exp) => exp.date.startsWith(monthYear))
      .map((exp) => ({
        date: exp.date,
        category: categories.find((c) => c.id === exp.categoryId)?.name || 'Lainnya',
        description: exp.description,
        amount: exp.amount,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const categoryTotals = categories
      .map((cat) => {
        const total = expenses
          .filter((exp) => exp.categoryId === cat.id && exp.date.startsWith(monthYear))
          .reduce((sum, exp) => sum + exp.amount, 0);
        return {
          category: cat.name,
          color: cat.color,
          amount: total,
          percentage:
            expenses
              .filter((exp) => exp.date.startsWith(monthYear))
              .reduce((sum, exp) => sum + exp.amount, 0) > 0
              ? (total /
                  expenses
                    .filter((exp) => exp.date.startsWith(monthYear))
                    .reduce((sum, exp) => sum + exp.amount, 0)) *
                100
              : 0,
        };
      })
      .filter((cat) => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    exportMonthlyReport(exportData, categoryTotals, monthlyBudget, monthYear);
  };

  const handleExportDaily = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    const exportData = expenses
      .filter((exp) => exp.date === dateStr)
      .map((exp) => ({
        date: exp.date,
        category: categories.find((c) => c.id === exp.categoryId)?.name || 'Lainnya',
        description: exp.description,
        amount: exp.amount,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const dailyBudget = monthlyBudget > 0 ? Math.round(monthlyBudget / 30) : 0;

    exportDailyReport(exportData, dailyBudget, selectedDate);
  };

  return (
    <button
      onClick={isDaily ? handleExportDaily : handleExportMonthly}
      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
      title={isDaily ? 'Export laporan harian ke Excel' : 'Export laporan bulanan ke Excel'}
    >
      <Download size={16} />
      {isDaily ? 'Export XLS' : 'Export XLS'}
    </button>
  );
}

export default memo(ExportButtonComponent);
