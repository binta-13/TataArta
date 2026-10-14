export const COLORS = [
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

export const BUDGET_PERIODS = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
} as const;

export const TAB_LABELS = {
  day: 'Harian',
  month: 'Bulanan',
} as const;

export const VALIDATION = {
  MIN_AMOUNT: 0,
  MAX_DESCRIPTION_LENGTH: 100,
  MIN_CATEGORY_NAME_LENGTH: 1,
  MAX_CATEGORY_NAME_LENGTH: 50,
} as const;

export const ERROR_MESSAGES = {
  REQUIRED_AMOUNT: 'Jumlah harus diisi',
  REQUIRED_CATEGORY: 'Kategori harus dipilih',
  REQUIRED_NAME: 'Nama kategori harus diisi',
  REQUIRED_BUDGET: 'Jumlah budget harus diisi',
  INVALID_AMOUNT: 'Jumlah harus bernilai positif',
  DELETE_CATEGORY_CONFIRM: 'Hapus kategori ini? Semua pengeluaran dengan kategori ini juga akan terhapus.',
  DELETE_EXPENSE_CONFIRM: 'Hapus pengeluaran ini?',
} as const;

export const EMPTY_STATES = {
  NO_EXPENSES: 'Belum ada pengeluaran',
  NO_EXPENSES_CTA: 'Tekan tombol + untuk mencatat pengeluaran',
  NO_CATEGORIES: 'Belum ada kategori',
} as const;
