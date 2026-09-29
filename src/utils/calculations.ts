import { Labour, DailyAttendance, LabourPayment, ProjectExpense, LabourSummary, CurrencyCode } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  RWF: 'RWF ',
  KES: 'KSh ',
  UGX: 'USh ',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'AU$',
  ZAR: 'R ',
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const formattedNumber = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  if (amount < 0) {
    return `-${symbol}${formattedNumber}`;
  }
  return `${symbol}${formattedNumber}`;
}

/**
 * Automatically calculates daily pay based on worker wage type, hours, and rates
 */
export function calculateAttendanceWage(
  labour: Labour,
  status: DailyAttendance['status'],
  regularHours: number,
  overtimeHours: number,
  customHourlyRate?: number,
  customOtMultiplier?: number
): {
  regularWage: number;
  overtimeWage: number;
  totalWage: number;
  hourlyRateApplied: number;
  overtimeRateApplied: number;
} {
  const multiplier = customOtMultiplier ?? labour.overtimeMultiplier ?? 1.5;

  if (labour.wageType === 'hourly') {
    const rate = customHourlyRate ?? labour.defaultRate;
    const otRate = rate * multiplier;

    let effectiveRegularHours = regularHours;
    if (status === 'absent' || status === 'leave') {
      effectiveRegularHours = 0;
    }

    const regularWage = effectiveRegularHours * rate;
    const overtimeWage = (status !== 'absent' ? overtimeHours : 0) * otRate;
    const totalWage = Math.round((regularWage + overtimeWage) * 100) / 100;

    return {
      regularWage: Math.round(regularWage * 100) / 100,
      overtimeWage: Math.round(overtimeWage * 100) / 100,
      totalWage,
      hourlyRateApplied: rate,
      overtimeRateApplied: otRate,
    };
  } else {
    // Daily wage calculation
    const dailyRate = customHourlyRate ?? labour.defaultRate;
    const stdHours = labour.standardDailyHours || 8;
    const equivHourlyRate = dailyRate / stdHours;
    const otRate = equivHourlyRate * multiplier;

    let regularWage = 0;
    if (status === 'present') {
      regularWage = dailyRate;
    } else if (status === 'half_day') {
      regularWage = dailyRate / 2;
    } else {
      regularWage = 0;
    }

    const overtimeWage = (status !== 'absent' ? overtimeHours : 0) * otRate;
    const totalWage = Math.round((regularWage + overtimeWage) * 100) / 100;

    return {
      regularWage: Math.round(regularWage * 100) / 100,
      overtimeWage: Math.round(overtimeWage * 100) / 100,
      totalWage,
      hourlyRateApplied: dailyRate,
      overtimeRateApplied: otRate,
    };
  }
}

/**
 * Computes individual worker summary across all project attendances and payments
 */
export function computeLabourSummary(
  labour: Labour,
  attendances: DailyAttendance[],
  payments: LabourPayment[]
): LabourSummary {
  const workerAttendances = attendances.filter((a) => a.labourId === labour.id);
  const workerPayments = payments.filter((p) => p.labourId === labour.id);

  let daysPresent = 0;
  let daysHalf = 0;
  let totalRegularHours = 0;
  let totalOvertimeHours = 0;
  let totalGrossWage = 0;

  for (const att of workerAttendances) {
    if (att.status === 'present') daysPresent++;
    if (att.status === 'half_day') daysHalf++;
    totalRegularHours += att.regularHours || 0;
    totalOvertimeHours += att.overtimeHours || 0;
    totalGrossWage += att.dailyWageCalculated || 0;
  }

  let totalPaid = 0;
  let totalAdvancesDeducted = 0;

  for (const pay of workerPayments) {
    totalPaid += pay.amount || 0;
    totalAdvancesDeducted += pay.advanceDeduction || 0;
  }

  const netPaid = totalPaid;
  const balanceDue = Math.round((totalGrossWage - netPaid) * 100) / 100;

  return {
    labour,
    daysPresent,
    daysHalf,
    totalRegularHours: Math.round(totalRegularHours * 10) / 10,
    totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
    totalHours: Math.round((totalRegularHours + totalOvertimeHours) * 10) / 10,
    totalGrossWage: Math.round(totalGrossWage * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalAdvancesDeducted: Math.round(totalAdvancesDeducted * 100) / 100,
    netPaid: Math.round(netPaid * 100) / 100,
    balanceDue,
  };
}

/**
 * Computes overall project financials
 */
export function computeProjectFinancials(
  projectId: string,
  labours: Labour[],
  attendances: DailyAttendance[],
  payments: LabourPayment[],
  expenses: ProjectExpense[],
  budget: number
) {
  const projectLabours = labours.filter((l) => l.projectId === projectId);
  const projectAttendances = attendances.filter((a) => a.projectId === projectId);
  const projectPayments = payments.filter((p) => p.projectId === projectId);
  const projectExpenses = expenses.filter((e) => e.projectId === projectId);

  const labourSummaries = projectLabours.map((l) =>
    computeLabourSummary(l, projectAttendances, projectPayments)
  );

  const totalLabourGross = labourSummaries.reduce((sum, s) => sum + s.totalGrossWage, 0);
  const totalLabourPaid = labourSummaries.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalLabourOutstanding = labourSummaries.reduce((sum, s) => sum + s.balanceDue, 0);
  const totalHoursWorked = labourSummaries.reduce((sum, s) => sum + s.totalHours, 0);

  const totalExpenses = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  for (const exp of projectExpenses) {
    expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
  }

  const grandTotalCost = totalLabourGross + totalExpenses;
  const remainingBudget = budget - grandTotalCost;
  const budgetPercentage = budget > 0 ? (grandTotalCost / budget) * 100 : 0;

  return {
    activeLabourCount: projectLabours.filter((l) => l.status === 'active').length,
    totalLabourCount: projectLabours.length,
    totalLabourGross: Math.round(totalLabourGross * 100) / 100,
    totalLabourPaid: Math.round(totalLabourPaid * 100) / 100,
    totalLabourOutstanding: Math.round(totalLabourOutstanding * 100) / 100,
    totalHoursWorked: Math.round(totalHoursWorked * 10) / 10,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    expensesByCategory,
    grandTotalCost: Math.round(grandTotalCost * 100) / 100,
    remainingBudget: Math.round(remainingBudget * 100) / 100,
    budgetPercentage: Math.min(Math.round(budgetPercentage * 10) / 10, 999),
    isOverBudget: grandTotalCost > budget && budget > 0,
    labourSummaries,
  };
}
