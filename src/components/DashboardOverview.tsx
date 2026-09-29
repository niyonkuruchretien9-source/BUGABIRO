import React from 'react';
import { Project, Labour, DailyAttendance, LabourPayment, ProjectExpense, CurrencyCode } from '../types';
import { formatCurrency, computeProjectFinancials } from '../utils/calculations';
import { 
  Users, 
  Clock, 
  Receipt, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  Plus,
  Calendar,
  Wallet
} from 'lucide-react';

interface DashboardOverviewProps {
  project: Project;
  labours: Labour[];
  attendances: DailyAttendance[];
  payments: LabourPayment[];
  expenses: ProjectExpense[];
  currency: CurrencyCode;
  onNavigateTab: (tab: 'timesheet' | 'labour' | 'expenses' | 'payments' | 'analytics') => void;
  onOpenAddLabour: () => void;
  onOpenAddExpense: () => void;
  onOpenRecordPayment: () => void;
  onSelectLabourForSlip: (labour: Labour) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  project,
  labours,
  attendances,
  payments,
  expenses,
  currency,
  onNavigateTab,
  onOpenAddLabour,
  onOpenAddExpense,
  onOpenRecordPayment,
  onSelectLabourForSlip,
}) => {
  const financials = computeProjectFinancials(
    project.id,
    labours,
    attendances,
    payments,
    expenses,
    project.budget
  );

  // Today's date YYYY-MM-DD
  const todayStr = '2026-09-29';
  const todayAttendances = attendances.filter(
    (a) => a.projectId === project.id && a.date === todayStr
  );
  const projectLabours = labours.filter((l) => l.projectId === project.id);

  const todayHours = todayAttendances.reduce(
    (sum, a) => sum + (a.regularHours + a.overtimeHours),
    0
  );
  const todayCost = todayAttendances.reduce((sum, a) => sum + a.dailyWageCalculated, 0);

  // Top 4 expense categories
  const categoryEntries = Object.entries(financials.expensesByCategory).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Project Financials Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Project Overview</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{project.code}</span>
            <span aria-hidden="true">·</span>
            <span>Started {project.startDate}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {project.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {project.location} · Client: <span className="text-slate-200">{project.client}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('timesheet')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-500/20 active:scale-95"
          >
            <Clock className="w-4 h-4" />
            <span>Today's Timesheet</span>
          </button>
          <button
            onClick={onOpenAddLabour}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>+ Add Worker</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Combined Project Spend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Project Spend</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
              {formatCurrency(financials.grandTotalCost, currency)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Labour: {formatCurrency(financials.totalLabourGross, currency)}</span>
              <span>+</span>
              <span>Expenses: {formatCurrency(financials.totalExpenses, currency)}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Allocated Budget</span>
            <span className="font-mono text-slate-200 font-medium">
              {formatCurrency(project.budget, currency)}
            </span>
          </div>
        </div>

        {/* Card 2: Total Labour Wages Earned */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Labour Wages</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
              {formatCurrency(financials.totalLabourGross, currency)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span className="font-mono tabular-nums">{financials.totalHoursWorked} hrs logged</span>
              <span>·</span>
              <span>{financials.totalLabourCount} workers</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Today's Labour Cost</span>
            <span className="font-mono text-emerald-400 font-medium">
              {formatCurrency(todayCost, currency)}
            </span>
          </div>
        </div>

        {/* Card 3: Disbursed vs Unpaid Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Labour Outstanding Due</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-amber-400 tracking-tight tabular-nums">
              {formatCurrency(financials.totalLabourOutstanding, currency)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Paid: </span>
              <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                {formatCurrency(financials.totalLabourPaid, currency)}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <button
              onClick={onOpenRecordPayment}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>Disburse Payout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400">
              {financials.totalLabourOutstanding > 0 ? 'Pending payout' : 'Settled'}
            </span>
          </div>
        </div>

        {/* Card 4: Other Project Expenses */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Other Expenses</span>
            <Receipt className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
              {formatCurrency(financials.totalExpenses, currency)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>{expenses.filter((e) => e.projectId === project.id).length} recorded invoices</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>View Expense Register</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Budget Progress Bar Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">Budget Consumption</span>
            <span className="text-xs text-slate-400">
              ({financials.budgetPercentage}% spent of {formatCurrency(project.budget, currency)})
            </span>
          </div>
          <div className="text-xs font-mono text-slate-300">
            Remaining Headroom:{' '}
            <span className={financials.isOverBudget ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
              {formatCurrency(financials.remainingBudget, currency)}
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
          {/* Labour portion */}
          <div
            className="bg-amber-400 h-2.5 transition-all duration-300"
            style={{
              width: `${project.budget > 0 ? Math.min((financials.totalLabourGross / project.budget) * 100, 100) : 0}%`,
            }}
            title={`Labour: ${formatCurrency(financials.totalLabourGross, currency)}`}
          />
          {/* Expenses portion */}
          <div
            className="bg-indigo-500 h-2.5 transition-all duration-300"
            style={{
              width: `${project.budget > 0 ? Math.min((financials.totalExpenses / project.budget) * 100, 100) : 0}%`,
            }}
            title={`Other Expenses: ${formatCurrency(financials.totalExpenses, currency)}`}
          />
        </div>
        <div className="flex items-center gap-6 mt-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span>Labour Wages ({formatCurrency(financials.totalLabourGross, currency)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            <span>Materials & Expenses ({formatCurrency(financials.totalExpenses, currency)})</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
            <span>Remaining Budget</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Today's Site Attendance & Top Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Today's Active Labour & Timesheet */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Today's On-Site Labour</span>
                <span className="text-xs text-slate-400 font-normal">({todayStr})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {todayAttendances.filter((a) => a.status === 'present').length} present · {todayHours} hours logged today
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('timesheet')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Full Daily Timesheet</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of today's attendance entries */}
          {todayAttendances.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-3">
              <Calendar className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">No attendance logged for today ({todayStr}) yet.</p>
              <button
                onClick={() => onNavigateTab('timesheet')}
                className="px-3.5 py-1.5 text-xs font-semibold bg-amber-400 text-slate-900 rounded-lg hover:bg-amber-300 transition-colors"
              >
                Log Today's Hours Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2 font-medium">Worker</th>
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Reg. Hrs</th>
                    <th className="pb-2 font-medium text-right">OT Hrs</th>
                    <th className="pb-2 font-medium text-right">Today's Pay</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {todayAttendances.map((att) => {
                    const worker = projectLabours.find((l) => l.id === att.labourId);
                    if (!worker) return null;
                    return (
                      <tr key={att.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 font-medium text-slate-200 flex items-center gap-2.5">
                          {worker.avatarUrl ? (
                            <img
                              src={worker.avatarUrl}
                              alt={worker.name}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {worker.name.charAt(0)}
                            </div>
                          )}
                          <span className="truncate">{worker.name}</span>
                        </td>
                        <td className="py-2.5 text-slate-400">{worker.role}</td>
                        <td className="py-2.5">
                          <span className={`capitalize ${
                            att.status === 'present' ? 'text-emerald-400 font-medium' :
                            att.status === 'half_day' ? 'text-amber-400 font-medium' :
                            'text-slate-400'
                          }`}>
                            {att.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-right tabular-nums text-slate-200">
                          {att.regularHours}h
                        </td>
                        <td className="py-2.5 font-mono text-right tabular-nums text-amber-400">
                          {att.overtimeHours > 0 ? `+${att.overtimeHours}h` : '—'}
                        </td>
                        <td className="py-2.5 font-mono text-right tabular-nums font-semibold text-slate-100">
                          {formatCurrency(att.dailyWageCalculated, currency)}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => onSelectLabourForSlip(worker)}
                            className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            Pay Slip
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Top Expense Categories */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-white">Expense Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">Non-labour material & site costs</p>
            </div>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              All
            </button>
          </div>

          <div className="space-y-3">
            {categoryEntries.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No expenses recorded yet.</p>
            ) : (
              categoryEntries.slice(0, 5).map(([category, amount]) => {
                const percentage = financials.totalExpenses > 0
                  ? Math.round((amount / financials.totalExpenses) * 100)
                  : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-slate-300 font-medium">
                        {category.replace('_', ' ')}
                      </span>
                      <span className="font-mono tabular-nums text-slate-200 font-semibold">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-400 h-1.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 text-right font-mono">
                      {percentage}% of non-labour costs
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Add Expense Shortcut */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={onOpenAddExpense}
              className="w-full py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Expense Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
