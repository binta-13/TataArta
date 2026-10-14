export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  categoryId: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface MonthlyBudget {
  id: string;
  amount: number;
  month: string;
  spent: number;
}

export interface AppData {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  monthlyBudget?: MonthlyBudget;
}
