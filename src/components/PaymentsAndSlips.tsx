import React, { useState } from 'react';
import { Project, Labour, DailyAttendance, LabourPayment, CurrencyCode } from '../types';
import { formatCurrency, computeLabourSummary } from '../utils/calculations';
import { 
  CreditCard, 
  Plus, 
  Search, 
  FileText, 
  DollarSign, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  Trash2
} from 'lucide-react';

interface PaymentsAndSlipsProps {
  project: Project;
  labours: Labour[];
  attendances: DailyAttendance[];
  payments: LabourPayment[];
  currency: CurrencyCode;
  onOpenRecordPayment: (preselectedLabour?: Labour) => void;
  onDeletePayment: (paymentId: string) => void;
  onSelectLabourForSlip: (labour: Labour) => void;
}

export const PaymentsAndSlips: React.FC<PaymentsAndSlipsProps> = ({
  project,
  labours,
  attendances,
  payments,
  currency,
  onOpenRecordPayment,
  onDeletePayment,
  onSelectLabourForSlip,
}) => {
  const [activeTab, setActiveTab] = useState<'balances' | 'history'>('balances');
  const [searchQuery, setSearchQuery] = useState('');

  const projectLabours = labours.filter((l) => l.projectId === project.id);
  const projectPayments = payments.filter((p) => p.projectId === project.id);

  const labourSummaries = projectLabours.map((l) =>
    computeLabourSummary(l, attendances, payments)
  );

  const totalGross = labourSummaries.reduce((s, item) => s + item.totalGrossWage, 0);
  const totalDisbursed = labourSummaries.reduce((s, item) => s + item.totalPaid, 0);
  const totalBalanceDue = labourSummaries.reduce((s, item) => s + item.balanceDue, 0);

  const filteredSummaries = labourSummaries.filter(({ labour }) =>
    labour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    labour.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayments = projectPayments.filter((p) => {
    const lab = projectLabours.find((l) => l.id === p.labourId);
    return (
      (lab && lab.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.referenceNo && p.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Disburse Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Payroll & Settlement</span>
            <span aria-hidden="true">·</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Labour Wages Payout & Receipts</span>
          </h1>
        </div>

        <button
          onClick={() => onOpenRecordPayment()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-500/20 active:scale-95"
        >
          <CreditCard className="w-4 h-4" />
          <span>Record New Payout</span>
        </button>
      </div>

      {/* Aggregate Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Total Calculated Wages</p>
          <p className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(totalGross, currency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Based on daily recorded timesheets</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Total Disbursed Payments</p>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatCurrency(totalDisbursed, currency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{projectPayments.length} payment transactions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Outstanding Balance Payable</p>
          <p className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatCurrency(totalBalanceDue, currency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Unpaid wages across crew</p>
        </div>
      </div>

      {/* Tabs: Worker Balances vs Payout History */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'balances'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Worker Balances & Slips ({labourSummaries.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Disbursal History ({projectPayments.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by worker name or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Tab 1: Worker Balances & Slips */}
      {activeTab === 'balances' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Worker</th>
                  <th className="py-3 px-3">Trade & Rate</th>
                  <th className="py-3 px-3 text-right">Hours Logged</th>
                  <th className="py-3 px-3 text-right">Total Gross</th>
                  <th className="py-3 px-3 text-right">Total Paid</th>
                  <th className="py-3 px-3 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSummaries.map(({ labour, totalHours, totalGrossWage, totalPaid, balanceDue }) => {
                  return (
                    <tr key={labour.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{labour.name}</div>
                        <div className="text-[11px] text-slate-400">{labour.role}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-200">
                          {formatCurrency(labour.defaultRate, currency)}/{labour.wageType === 'hourly' ? 'hr' : 'day'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                        {totalHours}h
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-100">
                        {formatCurrency(totalGrossWage, currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                        {formatCurrency(totalPaid, currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                        <span className={balanceDue > 0 ? 'text-amber-400' : 'text-slate-400'}>
                          {formatCurrency(balanceDue, currency)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenRecordPayment(labour)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 transition-colors"
                          >
                            Pay
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectLabourForSlip(labour)}
                            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Slip</span>
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

      {/* Tab 2: Disbursal History */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <p className="text-sm">No payout records found.</p>
              <p className="text-xs">Record payments when disbursing cash or wire transfers to workers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Labour Name</th>
                    <th className="py-3 px-3">Payment Method</th>
                    <th className="py-3 px-3">Reference / Voucher</th>
                    <th className="py-3 px-3">Period / Notes</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPayments.map((p) => {
                    const lab = projectLabours.find((l) => l.id === p.labourId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-300">{p.date}</td>
                        <td className="py-3 px-4 font-medium text-slate-100">
                          {lab ? lab.name : 'Unknown worker'}
                        </td>
                        <td className="py-3 px-3 capitalize text-slate-300">
                          {p.paymentMethod.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {p.referenceNo || '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {p.payPeriod ? `${p.payPeriod} · ` : ''}{p.notes || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                          {formatCurrency(p.amount, currency)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onDeletePayment(p.id)}
                            title="Delete Payment Record"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}
    </div>
  );
};
