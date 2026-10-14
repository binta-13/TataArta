'use client';

import { useLocalStorage } from '@/lib/useLocalStorage';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import {
  Calendar,
  Check,
  Plus,
  Settings,
  Tag,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { CategoryIcon, resolveCategoryIcon } from '@/lib/icons';
import { formatCurrency } from '@/lib/format';
import BottomNav from './components/BottomNav';
import ExpenseChart from './components/ExpenseChart';
import BudgetProgress from './components/BudgetProgress';
import MonthlyChart from './components/MonthlyChart';
import DailyChart from './components/DailyChart';
import ExportButton from './components/ExportButton';
import Modal from './components/Modal';
import Button from './components/Button';
import Input from './components/Input';

type Tab = 'day' | 'month';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

export default function Home() {
  const { data, isLoaded, addExpense, deleteExpense, setMonthlyBudget } = useLocalStorage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<Tab>('day');
  const [budgetAmount, setBudgetAmount] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const filteredExpenses = useMemo(() => {
    if (!isLoaded) return [];

    const start =
      activeTab === 'day' ? startOfDay(selectedDate) : startOfMonth(selectedDate);
    const end = activeTab === 'day' ? endOfDay(selectedDate) : endOfMonth(selectedDate);

    return data.expenses
      .filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= start && expDate <= end;
      })
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime() ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [data.expenses, selectedDate, activeTab, isLoaded]);

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    [filteredExpenses]
  );

  const expensesByCategory = useMemo(() => {
    const grouped = filteredExpenses.reduce((acc, exp) => {
      acc[exp.categoryId] = (acc[exp.categoryId] ?? 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([categoryId, amount]) => ({
        category: data.categories.find((c) => c.id === categoryId),
        amount,
      }))
      .filter((item) => item.category)
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, data.categories]);

  const resetForm = () =>
    setFormData({
      amount: '',
      categoryId: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.categoryId) return;

    addExpense({
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryId,
      description: formData.description,
      date: formData.date,
    });

    resetForm();
    setShowAddModal(false);
  };

  const openAddModal = () => {
    setFormData({
      amount: '',
      categoryId: '',
      description: '',
      date: format(activeTab === 'day' ? selectedDate : new Date(), 'yyyy-MM-dd'),
    });
    setShowAddModal(true);
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount) return;
    setMonthlyBudget(parseFloat(budgetAmount));
    setBudgetAmount('');
    setShowBudgetModal(false);
  };

  const chartData = useMemo(
    () =>
      expensesByCategory.map(({ category, amount }) => ({
        name: category!.name,
        value: amount,
        color: category!.color,
      })),
    [expensesByCategory]
  );

  const monthlyChartData = useMemo(() => {
    const monthlyTotals: Record<string, number> = {};
    
    data.expenses.forEach((exp) => {
      const month = exp.date.substring(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] ?? 0) + exp.amount;
    });

    return Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, total]) => ({
        month: format(new Date(month + '-01'), 'MMM yyyy', { locale: id }),
        total,
      }));
  }, [data.expenses]);

  const dailyChartData = useMemo(() => {
    const currentMonth = format(selectedDate, 'yyyy-MM');
    const dailyTotals: Record<string, number> = {};
    
    data.expenses
      .filter((exp) => exp.date.startsWith(currentMonth))
      .forEach((exp) => {
        const day = exp.date.substring(8, 10);
        dailyTotals[day] = (dailyTotals[day] ?? 0) + exp.amount;
      });

    return Object.entries(dailyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, total]) => ({
        date: format(new Date(currentMonth + '-' + day), 'dd MMM', { locale: id }),
        total,
      }));
  }, [data.expenses, selectedDate]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
          <span className="text-sm font-medium">Memuat data…</span>
        </div>
      </div>
    );
  }

  const periodLabel = activeTab === 'day' ? 'Hari Ini' : 'Bulan Ini';
  const transactionCount = filteredExpenses.length;
  const categoryCount = expensesByCategory.length;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 pb-24 pt-8 text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5">
          <div>
            <p className="text-sm font-medium text-indigo-100">{getGreeting()} 👋</p>
            <h1 className="text-2xl font-bold tracking-tight">Catatan Pengeluaran</h1>
          </div>
          <Link
            href="/categories"
            aria-label="Kelola kategori"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
          >
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto -mt-20 max-w-2xl px-5">
        {/* Summary Card */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total {periodLabel}</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Wallet size={24} />
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <TrendingUp size={18} className="text-indigo-500" />
              <div>
                <p className="text-lg font-bold text-slate-800">{transactionCount}</p>
                <p className="text-xs text-slate-500">Transaksi</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <Tag size={18} className="text-violet-500" />
              <div>
                <p className="text-lg font-bold text-slate-800">{categoryCount}</p>
                <p className="text-xs text-slate-500">Kategori</p>
              </div>
            </div>
          </div>
        </section>

        {/* Segmented Tabs */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1">
          {(['day', 'month'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'day' ? 'Harian' : 'Bulanan'}
            </button>
          ))}
        </div>

        {/* Date Selector */}
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
          <Calendar size={18} className="text-indigo-500" />
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
          />
        </div>

        {/* Daily Export - Only show on day view */}
        {activeTab === 'day' && (
          <div className="mt-3 flex justify-end">
            <ExportButton
              expenses={data.expenses}
              categories={data.categories}
              monthlyBudget={data.monthlyBudget?.amount ?? 0}
              selectedDate={selectedDate}
              isDaily={true}
            />
          </div>
        )}

        {/* Budget Progress - Only show on month view */}
        {activeTab === 'month' && (
          <>
            <div className="mt-3 flex justify-end">
              <ExportButton
                expenses={data.expenses}
                categories={data.categories}
                monthlyBudget={data.monthlyBudget?.amount ?? 0}
                selectedDate={selectedDate}
              />
            </div>
            <BudgetProgress
              spent={data.monthlyBudget?.spent ?? 0}
              total={data.monthlyBudget?.amount ?? 0}
              onSetBudget={() => {
                setBudgetAmount(data.monthlyBudget?.amount.toString() ?? '');
                setShowBudgetModal(true);
              }}
            />
          </>
        )}

        {/* Expense Chart */}
        {activeTab === 'month' && <ExpenseChart data={chartData} />}

        {/* Monthly Chart - Trend bulanan */}
        {activeTab === 'month' && (
          <MonthlyChart 
            data={monthlyChartData}
            budgetAmount={data.monthlyBudget?.amount ?? 0}
          />
        )}

        {/* Daily Chart - Trend harian */}
        {activeTab === 'day' && (
          <DailyChart 
            data={dailyChartData}
            budgetAmount={data.monthlyBudget?.amount ?? 0}
          />
        )}

        {/* Category Breakdown */}
        {expensesByCategory.length > 0 && (
          <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Per Kategori</h3>
            <div className="space-y-4">
              {expensesByCategory.map(({ category, amount }) => {
                const percent = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={category!.id}>
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: category!.color }}
                      >
                        <CategoryIcon name={category!.icon} size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-700">{category!.name}</span>
                          <span className="text-sm font-semibold text-slate-900">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        {category!.description && (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {category!.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 ml-12 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percent}%`, backgroundColor: category!.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Expenses */}
        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Riwayat Pengeluaran</h3>
          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <Wallet size={26} />
              </span>
              <p className="text-sm font-medium text-slate-500">Belum ada pengeluaran</p>
              <p className="text-xs text-slate-400">
                Tekan tombol + untuk mencatat pengeluaran
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredExpenses.map((expense) => {
                const category = data.categories.find((c) => c.id === expense.categoryId);
                const color = category?.color ?? '#64748b';
                const Icon = resolveCategoryIcon(category?.icon);
                return (
                  <li
                    key={expense.id}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-slate-200"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: color }}
                    >
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {expense.description || category?.name || 'Pengeluaran'}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {category?.name}
                        {!isSameDay(new Date(expense.date), new Date()) && (
                          <> · {format(new Date(expense.date), 'dd MMM yyyy', { locale: id })}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(expense.amount)}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Hapus pengeluaran ini?')) deleteExpense(expense.id);
                        }}
                        aria-label="Hapus"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {/* Floating Add Button */}
      <button
        onClick={openAddModal}
        aria-label="Tambah pengeluaran"
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
      >
        <Plus size={26} />
      </button>

      <BottomNav />

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Pengeluaran">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Jumlah</label>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
              <span className="text-lg font-semibold text-slate-400">Rp</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="any"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                className="w-full bg-transparent px-3 py-3 text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-300"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Kategori</label>
            <div className="grid grid-cols-3 gap-2">
              {data.categories.map((cat) => {
                const selected = formData.categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                    className={`flex items-center gap-2 rounded-2xl border p-2.5 text-left transition ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={16} />
                    </span>
                    <span className="truncate text-xs font-medium text-slate-700">{cat.name}</span>
                    {selected && <Check size={14} className="ml-auto text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Deskripsi <span className="text-slate-400">(opsional)</span>
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Contoh: Makan siang"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Tanggal</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Budget Modal */}
      <Modal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        title="Atur Budget Bulanan"
      >
        <form onSubmit={handleBudgetSubmit} className="space-y-5">
          <Input
            label="Jumlah Budget (Rp)"
            type="number"
            inputMode="numeric"
            min="0"
            step="any"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            placeholder="0"
            required
            autoFocus
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowBudgetModal(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
