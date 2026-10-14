'use client';

import { useState, useEffect } from 'react';
import { Expense, Category, Budget, AppData, MonthlyBudget } from './types';
import { normalizeCategoryIcon } from './icons';
import { format } from 'date-fns';

const STORAGE_KEY = 'expense-tracker-data';

const defaultCategories: Category[] = [
  { id: '1', name: 'Makanan', color: '#f43f5e', icon: 'utensils' },
  { id: '2', name: 'Transport', color: '#3b82f6', icon: 'car' },
  { id: '3', name: 'Belanja', color: '#10b981', icon: 'shopping-cart' },
  { id: '4', name: 'Hiburan', color: '#f97316', icon: 'gamepad-2' },
  { id: '5', name: 'Tagihan', color: '#8b5cf6', icon: 'receipt-text' },
  { id: '6', name: 'Lainnya', color: '#64748b', icon: 'package' },
];

const defaultData: AppData = {
  expenses: [],
  categories: defaultCategories,
  budgets: [],
};

function migrateStoredData(stored: AppData): AppData {
  const categories = (stored.categories?.length ? stored.categories : defaultCategories).map(
    (category) => ({
      ...category,
      icon: normalizeCategoryIcon(category.icon),
    })
  );

  return {
    expenses: stored.expenses ?? [],
    categories,
    budgets: stored.budgets ?? [],
    monthlyBudget: stored.monthlyBudget,
  };
}

export function useLocalStorage() {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(migrateStoredData(JSON.parse(stored)));
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  useEffect(() => {
    if (isLoaded && data.monthlyBudget) {
      const currentMonth = format(new Date(), 'yyyy-MM');
      
      if (data.monthlyBudget.month !== currentMonth) {
        setData((prev) => ({
          ...prev,
          monthlyBudget: {
            id: currentMonth,
            amount: 0,
            month: currentMonth,
            spent: 0,
          },
        }));
      } else {
        const monthlyExpenses = data.expenses
          .filter((exp) => exp.date.startsWith(currentMonth))
          .reduce((sum, exp) => sum + exp.amount, 0);

        if (monthlyExpenses !== data.monthlyBudget.spent) {
          setData((prev) => ({
            ...prev,
            monthlyBudget: prev.monthlyBudget
              ? {
                  ...prev.monthlyBudget,
                  spent: monthlyExpenses,
                }
              : undefined,
          }));
        }
      }
    }
  }, [data.expenses, isLoaded]);

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    }));
  };

  const deleteExpense = (id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((exp) => exp.id !== id),
    }));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      ),
    }));
  };

  const deleteCategory = (id: string) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat.id !== id),
      expenses: prev.expenses.filter((exp) => exp.categoryId !== id),
      budgets: prev.budgets.filter((bud) => bud.categoryId !== id),
    }));
  };

  const setBudget = (budget: Budget) => {
    setData((prev) => ({
      ...prev,
      budgets: [
        ...prev.budgets.filter((b) => b.categoryId !== budget.categoryId),
        budget,
      ],
    }));
  };

  const deleteBudget = (categoryId: string) => {
    setData((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.categoryId !== categoryId),
    }));
  };

  const setMonthlyBudget = (amount: number) => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    setData((prev) => ({
      ...prev,
      monthlyBudget: {
        id: currentMonth,
        amount,
        month: currentMonth,
        spent: prev.monthlyBudget?.spent ?? 0,
      },
    }));
  };

  const updateMonthlyBudgetSpent = () => {
    if (!data.monthlyBudget) return;
    
    const currentMonth = format(new Date(), 'yyyy-MM');
    const monthlyExpenses = data.expenses
      .filter((exp) => exp.date.startsWith(currentMonth))
      .reduce((sum, exp) => sum + exp.amount, 0);

    if (monthlyExpenses !== data.monthlyBudget.spent) {
      setData((prev) => ({
        ...prev,
        monthlyBudget: prev.monthlyBudget
          ? {
              ...prev.monthlyBudget,
              spent: monthlyExpenses,
            }
          : undefined,
      }));
    }
  };

  return {
    data,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    setBudget,
    deleteBudget,
    setMonthlyBudget,
    updateMonthlyBudgetSpent,
  };
}
