import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ExportData {
  date: string;
  category: string;
  description: string;
  amount: number;
}

interface CategoryTotal {
  category: string;
  color: string;
  amount: number;
  percentage: number;
}

export function exportMonthlyReport(
  expenses: ExportData[],
  categoryTotals: CategoryTotal[],
  monthlyBudget: number,
  monthYear: string
) {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['LAPORAN PENGELUARAN BULANAN', '', '', ''],
    ['', '', '', ''],
    ['Bulan', format(new Date(monthYear + '-01'), 'MMMM yyyy', { locale: id }), '', ''],
    ['Total Pengeluaran', expenses.reduce((sum, exp) => sum + exp.amount, 0), '', ''],
    ['Budget Bulanan', monthlyBudget, '', ''],
    ['Sisa Budget', monthlyBudget - expenses.reduce((sum, exp) => sum + exp.amount, 0), '', ''],
    ['', '', '', ''],
    ['RINGKASAN PER KATEGORI', '', '', ''],
    ['Kategori', 'Jumlah', 'Persentase', 'Budget vs Pengeluaran'],
    ...categoryTotals.map((cat) => [
      cat.category,
      cat.amount,
      `${cat.percentage.toFixed(1)}%`,
      cat.amount <= monthlyBudget ? 'Normal' : 'Melebihi',
    ]),
    ['', '', '', ''],
    ['DETAIL PENGELUARAN', '', '', ''],
    ['Tanggal', 'Kategori', 'Deskripsi', 'Jumlah'],
    ...expenses.map((exp) => [
      format(new Date(exp.date), 'dd MMM yyyy', { locale: id }),
      exp.category,
      exp.description,
      exp.amount,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(summaryData);

  ws['!cols'] = [
    { wch: 20 },
    { wch: 18 },
    { wch: 15 },
    { wch: 20 },
  ];

  const headerStyle = {
    font: { bold: true, size: 14, color: 'FFFFFF' },
    fill: { fgColor: { rgb: 'FF4F46E5' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  const subHeaderStyle = {
    font: { bold: true, size: 11, color: 'FFFFFF' },
    fill: { fgColor: { rgb: 'FF6366F1' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  };

  const dataStyle = {
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: 'FFD1D5DB' },
      bottom: { style: 'thin', color: 'FFD1D5DB' },
      left: { style: 'thin', color: 'FFD1D5DB' },
      right: { style: 'thin', color: 'FFD1D5DB' },
    },
  };

  const currencyFormat = '_(* #,##0.00_);_(*  (#,##0.00);_(*  "-"??_);_(@_)';

  if (ws['A1']) ws['A1'].s = { ...headerStyle, font: { ...headerStyle.font, size: 16 } };

  for (let i = 2; i <= 6; i++) {
    if (ws[`A${i}`]) ws[`A${i}`].s = subHeaderStyle;
    if (ws[`B${i}`] && i !== 2) {
      ws[`B${i}`].s = { ...dataStyle, numFmt: currencyFormat };
    }
  }

  for (let i = 8; i <= 8 + categoryTotals.length + 1; i++) {
    if (ws[`A${i}`]) ws[`A${i}`].s = subHeaderStyle;
    if (ws[`B${i}`] && i > 9) ws[`B${i}`].s = { ...dataStyle, numFmt: currencyFormat };
  }

  const startDetailRow = 13 + categoryTotals.length;
  for (let i = startDetailRow; i < startDetailRow + expenses.length + 1; i++) {
    if (ws[`A${i}`]) ws[`A${i}`].s = dataStyle;
    if (ws[`B${i}`]) ws[`B${i}`].s = dataStyle;
    if (ws[`C${i}`]) ws[`C${i}`].s = dataStyle;
    if (ws[`D${i}`]) {
      ws[`D${i}`].s = { ...dataStyle, numFmt: currencyFormat };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Bulanan');

  const fileName = `Pengeluaran-${monthYear}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportDailyReport(
  expenses: ExportData[],
  dailyBudget: number,
  selectedDate: Date
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(selectedDate, 'yyyy-MM-dd', { locale: id });
  const dayName = format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id });

  const dailyExpenses = expenses.filter((exp) => exp.date === dateStr);
  const totalDaily = dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = dailyBudget - totalDaily;

  const categoryTotals: Record<string, number> = {};
  dailyExpenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] ?? 0) + exp.amount;
  });

  const summaryData = [
    ['LAPORAN PENGELUARAN HARIAN', '', '', ''],
    ['', '', '', ''],
    ['Tanggal', dayName, '', ''],
    ['Total Pengeluaran', totalDaily, '', ''],
    ['Budget Harian', dailyBudget, '', ''],
    ['Sisa Budget', remainingBudget, '', ''],
    ['Status', remainingBudget >= 0 ? 'Normal' : 'Melebihi Budget', '', ''],
    ['', '', '', ''],
    ['RINGKASAN PER KATEGORI', '', '', ''],
    ['Kategori', 'Jumlah', 'Persentase', ''],
    ...Object.entries(categoryTotals).map(([category, amount]) => [
      category,
      amount,
      totalDaily > 0 ? `${((amount / totalDaily) * 100).toFixed(1)}%` : '0%',
      '',
    ]),
    ['', '', '', ''],
    ['DETAIL PENGELUARAN', '', '', ''],
    ['Waktu Transaksi', 'Kategori', 'Deskripsi', 'Jumlah'],
    ...dailyExpenses.map((exp) => [
      exp.date,
      exp.category,
      exp.description,
      exp.amount,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(summaryData);

  ws['!cols'] = [
    { wch: 20 },
    { wch: 18 },
    { wch: 15 },
    { wch: 20 },
  ];

  const headerStyle = {
    font: { bold: true, size: 14, color: 'FFFFFF' },
    fill: { fgColor: { rgb: 'FF06B6D4' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  const subHeaderStyle = {
    font: { bold: true, size: 11, color: 'FFFFFF' },
    fill: { fgColor: { rgb: 'FF0891B2' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  };

  const dataStyle = {
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: 'FFD1D5DB' },
      bottom: { style: 'thin', color: 'FFD1D5DB' },
      left: { style: 'thin', color: 'FFD1D5DB' },
      right: { style: 'thin', color: 'FFD1D5DB' },
    },
  };

  const currencyFormat = '_(* #,##0.00_);_(*  (#,##0.00);_(*  "-"??_);_(@_)';

  if (ws['A1']) ws['A1'].s = { ...headerStyle, font: { ...headerStyle.font, size: 16 } };

  for (let i = 2; i <= 7; i++) {
    if (ws[`A${i}`]) ws[`A${i}`].s = subHeaderStyle;
    if (ws[`B${i}`] && i !== 2) {
      ws[`B${i}`].s = { ...dataStyle, numFmt: i <= 6 ? currencyFormat : 'General' };
    }
  }

  const categoryCount = Object.keys(categoryTotals).length;
  for (let i = 9; i <= 9 + categoryCount + 1; i++) {
    if (ws[`A${i}`]) ws[`A${i}`].s = subHeaderStyle;
    if (ws[`B${i}`] && i > 10) ws[`B${i}`].s = { ...dataStyle, numFmt: currencyFormat };
  }

  const startDetailRow = 14 + categoryCount;
  for (let i = startDetailRow; i < startDetailRow + dailyExpenses.length + 1; i++) {
    if (ws[`A${i}`]) ws[`A${i}`].s = dataStyle;
    if (ws[`B${i}`]) ws[`B${i}`].s = dataStyle;
    if (ws[`C${i}`]) ws[`C${i}`].s = dataStyle;
    if (ws[`D${i}`]) {
      ws[`D${i}`].s = { ...dataStyle, numFmt: currencyFormat };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Harian');

  const fileName = `Pengeluaran-${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
