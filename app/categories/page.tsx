'use client';

import { useLocalStorage } from '@/lib/useLocalStorage';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Pencil, Plus, Trash2, Wallet, X } from 'lucide-react';
import {
  CATEGORY_ICON_NAMES,
  DEFAULT_CATEGORY_ICON,
  resolveCategoryIcon,
} from '@/lib/icons';
import { formatCurrency } from '@/lib/format';
import BottomNav from '../components/BottomNav';

const colorList = [
  '#f43f5e',
  '#ec4899',
  '#d946ef',
  '#a855f7',
  '#8b5cf6',
  '#6366f1',
  '#3b82f6',
  '#0ea5e9',
  '#06b6d4',
  '#14b8a6',
  '#10b981',
  '#22c55e',
  '#84cc16',
  '#eab308',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#64748b',
];

type Period = 'daily' | 'weekly' | 'monthly';

const periodLabels: Record<Period, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
};

export default function CategoriesPage() {
  const {
    data,
    addCategory,
    updateCategory,
    deleteCategory,
    setBudget,
    deleteBudget,
  } = useLocalStorage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [selectedCategoryForBudget, setSelectedCategoryForBudget] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    icon: DEFAULT_CATEGORY_ICON,
    color: '#6366f1',
  });

  const [budgetData, setBudgetData] = useState({
    amount: '',
    period: 'monthly' as Period,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCategory) {
      updateCategory(editingCategory, formData);
      setEditingCategory(null);
    } else {
      addCategory(formData);
    }

    setFormData({ name: '', icon: DEFAULT_CATEGORY_ICON, color: '#6366f1' });
    setShowAddModal(false);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', icon: DEFAULT_CATEGORY_ICON, color: '#6366f1' });
    setShowAddModal(true);
  };

  const handleEdit = (categoryId: string) => {
    const category = data.categories.find((c) => c.id === categoryId);
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon || DEFAULT_CATEGORY_ICON,
        color: category.color,
      });
      setEditingCategory(categoryId);
      setShowAddModal(true);
    }
  };

  const handleDelete = (categoryId: string) => {
    if (
      confirm(
        'Hapus kategori ini? Semua pengeluaran dengan kategori ini juga akan terhapus.'
      )
    ) {
      deleteCategory(categoryId);
    }
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryForBudget || !budgetData.amount) return;

    setBudget({
      categoryId: selectedCategoryForBudget,
      amount: parseFloat(budgetData.amount),
      period: budgetData.period,
    });

    setBudgetData({ amount: '', period: 'monthly' });
    setSelectedCategoryForBudget(null);
    setShowBudgetModal(false);
  };

  const openBudgetModal = (categoryId: string) => {
    const existingBudget = data.budgets.find((b) => b.categoryId === categoryId);
    setBudgetData(
      existingBudget
        ? { amount: existingBudget.amount.toString(), period: existingBudget.period }
        : { amount: '', period: 'monthly' }
    );
    setSelectedCategoryForBudget(categoryId);
    setShowBudgetModal(true);
  };

  const getCategoryBudget = (categoryId: string) =>
    data.budgets.find((b) => b.categoryId === categoryId);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <header className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 pb-20 pt-8 text-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5">
          <Link
            href="/"
            aria-label="Kembali"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kelola Kategori</h1>
            <p className="text-sm text-indigo-100">Atur kategori &amp; budget kamu</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto -mt-14 max-w-2xl space-y-3 px-5">
        {data.categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-white py-12 text-center shadow-sm ring-1 ring-slate-100">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
              <Wallet size={26} />
            </span>
            <p className="text-sm font-medium text-slate-500">Belum ada kategori</p>
          </div>
        ) : (
          data.categories.map((category) => {
            const budget = getCategoryBudget(category.id);
            const Icon = resolveCategoryIcon(category.icon);
            return (
              <div
                key={category.id}
                className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{category.name}</p>
                    {budget ? (
                      <p className="truncate text-xs text-slate-500">
                        Budget {formatCurrency(budget.amount)} / {periodLabels[budget.period]}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">Belum ada budget</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openBudgetModal(category.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <Wallet size={14} />
                    {budget ? 'Edit Budget' : 'Set Budget'}
                  </button>
                  <button
                    onClick={() => handleEdit(category.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={openAddModal}
        aria-label="Tambah kategori"
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
      >
        <Plus size={26} />
      </button>

      <BottomNav />

      {/* Add / Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl">
            <div className="mb-5 flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                style={{ backgroundColor: formData.color }}
              >
                {(() => {
                  const Preview = resolveCategoryIcon(formData.icon);
                  return <Preview size={20} />;
                })()}
              </span>
              <h2 className="flex-1 text-lg font-bold text-slate-900">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                }}
                aria-label="Tutup"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Makanan"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Ikon</label>
                <div className="grid max-h-48 grid-cols-6 gap-2 overflow-y-auto rounded-2xl border border-slate-100 p-2">
                  {CATEGORY_ICON_NAMES.map((iconName) => {
                    const Icon = resolveCategoryIcon(iconName);
                    const selected = formData.icon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                        className={`flex aspect-square items-center justify-center rounded-xl transition ${
                          selected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Warna</label>
                <div className="grid grid-cols-9 gap-2">
                  {colorList.map((color) => {
                    const selected = formData.color === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        aria-label={`Pilih warna ${color}`}
                        className={`flex aspect-square items-center justify-center rounded-full transition ${
                          selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {selected && <Check size={14} className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.99]"
                >
                  {editingCategory ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && selectedCategoryForBudget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Set Budget</h2>
              <button
                onClick={() => {
                  setShowBudgetModal(false);
                  setSelectedCategoryForBudget(null);
                }}
                aria-label="Tutup"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">
                  Jumlah Budget
                </label>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                  <span className="text-lg font-semibold text-slate-400">Rp</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="any"
                    value={budgetData.amount}
                    onChange={(e) => setBudgetData({ ...budgetData, amount: e.target.value })}
                    placeholder="0"
                    className="w-full bg-transparent px-3 py-3 text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-300"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Periode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(periodLabels) as Period[]).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setBudgetData({ ...budgetData, period })}
                      className={`rounded-2xl border py-2.5 text-sm font-semibold transition ${
                        budgetData.period === period
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {periodLabels[period]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                {getCategoryBudget(selectedCategoryForBudget) && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteBudget(selectedCategoryForBudget);
                      setShowBudgetModal(false);
                      setSelectedCategoryForBudget(null);
                    }}
                    className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowBudgetModal(false);
                    setSelectedCategoryForBudget(null);
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.99]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
