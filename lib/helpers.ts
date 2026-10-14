export function generateId(): string {
  return Date.now().toString();
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

export function calculateExpenseStats(expenses: { amount: number }[]) {
  if (expenses.length === 0) {
    return { total: 0, average: 0, count: 0 };
  }

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const average = total / expenses.length;

  return { total, average, count: expenses.length };
}

export function groupByCategory(
  expenses: Array<{ categoryId: string; amount: number }>,
  categories: Array<{ id: string }>
): Record<string, number> {
  return expenses.reduce((acc, exp) => {
    acc[exp.categoryId] = (acc[exp.categoryId] ?? 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
}

export function calculateCategoryPercentage(amount: number, total: number): number {
  if (total === 0) return 0;
  return (amount / total) * 100;
}
