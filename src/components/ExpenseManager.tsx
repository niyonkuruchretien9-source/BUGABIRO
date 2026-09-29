import React, { useState, useMemo } from 'react';
import { Project, ProjectExpense, CurrencyCode, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/calculations';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Calendar, 
  Tag, 
  Building, 
  CreditCard,
  Download,
  Package,
  Wrench,
  Fuel,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface ExpenseManagerProps {
  project: Project;
  expenses: ProjectExpense[];
  currency: CurrencyCode;
  onOpenAddExpense: () => void;
  onOpenEditExpense: (expense: ProjectExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onExportExpensesCSV: () => void;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  materials: 'Materials & Raw Supplies',
  equipment_rental: 'Equipment & Plant Hire',
  transport_fuel: 'Transport & Fuel',
  subcontractor: 'Specialist Subcontractor',
  safety_gear: 'Safety & PPE Equipment',
  permits_licenses: 'Permits, Municipal & Fees',
  utilities: 'Site Power & Utilities',
  catering_water: 'Crew Water & Catering',
  site_supplies: 'Site Hardware & Consumables',
  misc: 'Miscellaneous Other',
};

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  project,
  expenses,
  currency,
  onOpenAddExpense,
  onOpenEditExpense,
  onDeleteExpense,
  onExportExpensesCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const projectExpenses = useMemo(() => {
    return expenses.filter((e) => e.projectId === project.id);
  }, [expenses, project.id]);

  const filteredExpenses = useMemo(() => {
    return projectExpenses.filter((exp) => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.vendor && exp.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (exp.receiptRef && exp.receiptRef.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || exp.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [projectExpenses, searchQuery, selectedCategory]);

  const totalExpenseCost = useMemo(() => {
    return projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [projectExpenses]);

  const materialsTotal = useMemo(() => {
    return projectExpenses
      .filter((e) => e.category === 'materials')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [projectExpenses]);

  const equipmentTotal = useMemo(() => {
    return projectExpenses
      .filter((e) => e.category === 'equipment_rental')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [projectExpenses]);

  const fuelTransportTotal = useMemo(() => {
    return projectExpenses
      .filter((e) => e.category === 'transport_fuel')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [projectExpenses]);

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Non-Labour Expenses Ledger</span>
            <span aria-hidden="true">·</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Project Expense Register</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {projectExpenses.length} entries
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExpensesCSV}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Expense</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Total Non-Labour Expenses</p>
          <p className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(totalExpenseCost, currency)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Raw Materials & Concrete</p>
          <p className="text-xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
            {formatCurrency(materialsTotal, currency)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Plant & Equipment Rental</p>
          <p className="text-xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
            {formatCurrency(equipmentTotal, currency)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Fuel & Transportation</p>
          <p className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatCurrency(fuelTransportTotal, currency)}
          </p>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses by item, vendor, or invoice ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Expense Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
              <option key={catKey} value={catKey}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <Receipt className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-semibold text-white">No Expenses Recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all'
              ? 'No expense invoices match your filter criteria.'
              : 'Add materials, plant hire, fuel, or municipal fee receipts to maintain full project accounting.'}
          </p>
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record First Expense</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Expense Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Vendor / Payee</th>
                  <th className="py-3 px-3">Method & Ref</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredExpenses.map((exp) => {
                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{exp.title}</div>
                        {exp.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5 max-w-md truncate">
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-300 text-xs">
                          {CATEGORY_LABELS[exp.category] || exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {exp.vendor || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="capitalize text-slate-300">
                          {exp.paymentMethod.replace('_', ' ')}
                        </div>
                        {exp.receiptRef && (
                          <div className="text-[10px] font-mono text-slate-400">
                            Ref: {exp.receiptRef}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-100 tabular-nums">
                        {formatCurrency(exp.amount, currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEditExpense(exp)}
                            title="Edit Expense"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(exp.id)}
                            title="Delete Expense"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
