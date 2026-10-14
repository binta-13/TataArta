export function validateExpenseAmount(amount: string): { valid: boolean; error?: string } {
  if (!amount) return { valid: false, error: 'Jumlah harus diisi' };
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    return { valid: false, error: 'Jumlah harus bernilai positif' };
  }
  return { valid: true };
}

export function validateCategoryName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Nama kategori harus diisi' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Nama kategori maksimal 50 karakter' };
  }
  return { valid: true };
}

export function validateBudgetAmount(amount: string): { valid: boolean; error?: string } {
  if (!amount) return { valid: false, error: 'Jumlah budget harus diisi' };
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    return { valid: false, error: 'Jumlah budget harus bernilai positif' };
  }
  return { valid: true };
}

export function validateExpenseForm(formData: {
  amount: string;
  categoryId: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const amountValidation = validateExpenseAmount(formData.amount);
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error || '';
  }

  if (!formData.categoryId) {
    errors.categoryId = 'Kategori harus dipilih';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
