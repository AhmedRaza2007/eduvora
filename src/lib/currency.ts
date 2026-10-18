/**
 * Currency formatting utility for Pakistani Rupees (PKR / Rs.)
 * Standardizes display across fees, expenses, salaries, reports, and dashboards.
 */
export function formatPKR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return 'Rs. 0';
  }
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(num)) {
    return 'Rs. 0';
  }
  return `Rs. ${num.toLocaleString('en-PK', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

export function formatPKRDecimals(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return 'Rs. 0.00';
  }
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(num)) {
    return 'Rs. 0.00';
  }
  return `Rs. ${num.toLocaleString('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

export const CURRENCY_CODE = 'PKR';
export const CURRENCY_SYMBOL = 'Rs.';
