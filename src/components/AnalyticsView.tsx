import React from 'react';
import { Project, Labour, DailyAttendance, LabourPayment, ProjectExpense, CurrencyCode } from '../types';
import { formatCurrency, computeProjectFinancials } from '../utils/calculations';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { CATEGORY_LABELS } from './ExpenseManager';

interface AnalyticsViewProps {
  project: Project;
  labours: Labour[];
  attendances: DailyAttendance[];
  payments: LabourPayment[];
  expenses: ProjectExpense[];
  currency: CurrencyCode;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  project,
  labours,
  attendances,
  payments,
  expenses,
  currency,
}) => {
  const financials = computeProjectFinancials(
    project.id,
    labours,
    attendances,
    payments,
    expenses,
    project.budget
  );

  const projectLabours = labours.filter((l) => l.projectId === project.id);
  const projectAttendances = attendances.filter((a) => a.projectId === project.id);

  // Group labour earnings by trade/role
  const earningsByTrade: Record<string, number> = {};
  for (const s of financials.labourSummaries) {
    const role = s.labour.role;
    earningsByTrade[role] = (earningsByTrade[role] || 0) + s.totalGrossWage;
  }

  const tradeEntries = Object.entries(earningsByTrade).sort((a, b) => b[1] - a[1]);

  // Labour vs Expense ratio
  const labourPct = financials.grandTotalCost > 0
    ? Math.round((financials.totalLabourGross / financials.grandTotalCost) * 100)
    : 0;
  const expensePct = financials.grandTotalCost > 0
    ? 100 - labourPct
    : 0;

  // Overtime statistics
  const totalRegularHours = financials.labourSummaries.reduce((s, i) => s + i.totalRegularHours, 0);
  const totalOvertimeHours = financials.labourSummaries.reduce((s, i) => s + i.totalOvertimeHours, 0);
  const totalHours = totalRegularHours + totalOvertimeHours;
  const overtimeRate = totalHours > 0 ? Math.round((totalOvertimeHours / totalHours) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span>Project Analytics & Cost Controls</span>
          <span aria-hidden="true">·</span>
          <span>{project.name}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Financial & Labour Cost Analytics
        </h1>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Total Project Cost</p>
          <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(financials.grandTotalCost, currency)}
          </p>
          <div className="text-[11px] text-slate-400 mt-2">
            Budget: {formatCurrency(project.budget, currency)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Labour Cost Share</p>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {labourPct}%
          </p>
          <div className="text-[11px] text-slate-400 mt-2">
            {formatCurrency(financials.totalLabourGross, currency)} total wages
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Non-Labour Expenses Share</p>
          <p className="text-2xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
            {expensePct}%
          </p>
          <div className="text-[11px] text-slate-400 mt-2">
            {formatCurrency(financials.totalExpenses, currency)} materials & equipment
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Overtime Ratio</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {overtimeRate}%
          </p>
          <div className="text-[11px] text-slate-400 mt-2">
            +{totalOvertimeHours}h OT of {totalHours}h total
          </div>
        </div>
      </div>

      {/* Two Column Layout: Labour by Trade & Expenses by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Labour Cost by Trade / Role */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Labour Wages by Trade</h2>
            <span className="text-xs font-mono text-slate-400">
              {formatCurrency(financials.totalLabourGross, currency)}
            </span>
          </div>

          <div className="space-y-3.5">
            {tradeEntries.map(([trade, wage]) => {
              const pct = financials.totalLabourGross > 0
                ? Math.round((wage / financials.totalLabourGross) * 100)
                : 0;
              return (
                <div key={trade} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{trade}</span>
                    <span className="font-mono tabular-nums text-slate-300 font-semibold">
                      {formatCurrency(wage, currency)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Expenses by Category</h2>
            <span className="text-xs font-mono text-slate-400">
              {formatCurrency(financials.totalExpenses, currency)}
            </span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(financials.expensesByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amount]) => {
                const pct = financials.totalExpenses > 0
                  ? Math.round((amount / financials.totalExpenses) * 100)
                  : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">
                        {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
                      </span>
                      <span className="font-mono tabular-nums text-slate-300 font-semibold">
                        {formatCurrency(amount, currency)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-400 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
