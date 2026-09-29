import React, { useState, useMemo } from 'react';
import { Project, Labour, DailyAttendance, LabourPayment, CurrencyCode } from '../types';
import { formatCurrency, computeLabourSummary } from '../utils/calculations';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CreditCard, 
  FileText, 
  Phone, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface LabourManagerProps {
  project: Project;
  labours: Labour[];
  attendances: DailyAttendance[];
  payments: LabourPayment[];
  currency: CurrencyCode;
  onOpenAddLabour: () => void;
  onOpenEditLabour: (labour: Labour) => void;
  onConfirmDeleteLabour: (labour: Labour) => void;
  onOpenPaymentForLabour: (labour: Labour) => void;
  onSelectLabourForSlip: (labour: Labour) => void;
}

export const LabourManager: React.FC<LabourManagerProps> = ({
  project,
  labours,
  attendances,
  payments,
  currency,
  onOpenAddLabour,
  onOpenEditLabour,
  onConfirmDeleteLabour,
  onOpenPaymentForLabour,
  onSelectLabourForSlip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter labours belonging to active project
  const projectLabours = useMemo(() => {
    return labours.filter((l) => l.projectId === project.id);
  }, [labours, project.id]);

  // Compute summary metrics per worker
  const labourSummaries = useMemo(() => {
    return projectLabours.map((l) =>
      computeLabourSummary(l, attendances, payments)
    );
  }, [projectLabours, attendances, payments]);

  // Filtered list
  const filteredSummaries = useMemo(() => {
    return labourSummaries.filter(({ labour }) => {
      const matchesSearch =
        labour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        labour.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        labour.phone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || labour.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || labour.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [labourSummaries, searchQuery, roleFilter, statusFilter]);

  // Unique roles for filtering
  const allRoles = useMemo(() => {
    const roles = new Set(projectLabours.map((l) => l.role));
    return Array.from(roles);
  }, [projectLabours]);

  // Aggregate stats
  const totalLabourers = projectLabours.length;
  const activeCount = projectLabours.filter((l) => l.status === 'active').length;
  const totalGrossEarned = labourSummaries.reduce((s, item) => s + item.totalGrossWage, 0);
  const totalOutstandingDue = labourSummaries.reduce((s, item) => s + item.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Crew Management</span>
            <span aria-hidden="true">·</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Labour Roster & Wage Summary</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {totalLabourers} registered
            </span>
          </h1>
        </div>

        <button
          onClick={onOpenAddLabour}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-500/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Labourer</span>
        </button>
      </div>

      {/* Aggregate Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Total Registered Crew</p>
          <p className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {totalLabourers} <span className="text-xs font-normal text-emerald-400">({activeCount} active)</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Total Project Gross Wages</p>
          <p className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(totalGrossEarned, currency)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Outstanding Payable</p>
          <p className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatCurrency(totalOutstandingDue, currency)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Disbursed Payments</p>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatCurrency(totalGrossEarned - totalOutstandingDue, currency)}
          </p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search labour by name, role, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Trades & Roles</option>
            {allRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Labour Table */}
      {filteredSummaries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <Users className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-semibold text-white">No Labourers Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'No workers match your current search and filter criteria.'
              : 'Add workers to calculate their daily pay, record payouts, and track balances.'}
          </p>
          <button
            onClick={onOpenAddLabour}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add First Labourer</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Labour Name & Contact</th>
                  <th className="py-3 px-3">Trade / Role</th>
                  <th className="py-3 px-3">Wage Rate</th>
                  <th className="py-3 px-3 text-right">Total Hours</th>
                  <th className="py-3 px-3 text-right">Gross Earned</th>
                  <th className="py-3 px-3 text-right">Paid to Date</th>
                  <th className="py-3 px-3 text-right">Balance Due</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSummaries.map(({ labour, totalHours, totalGrossWage, totalPaid, balanceDue }) => {
                  return (
                    <tr
                      key={labour.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Worker info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {labour.avatarUrl ? (
                            <img
                              src={labour.avatarUrl}
                              alt={labour.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {labour.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-2">
                              <span>{labour.name}</span>
                            </div>
                            <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{labour.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Trade / Role */}
                      <td className="py-3 px-3 text-slate-300">
                        <div className="font-medium">{labour.role}</div>
                        <div className="text-[10px] text-slate-400">
                          Joined {labour.joinedDate}
                        </div>
                      </td>

                      {/* Wage Rate */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-200 font-medium">
                          {formatCurrency(labour.defaultRate, currency)}
                          <span className="text-[10px] text-slate-400 ml-1">
                            /{labour.wageType === 'hourly' ? 'hr' : 'day'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          OT {labour.overtimeMultiplier}x
                        </div>
                      </td>

                      {/* Hours */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                        {totalHours}h
                      </td>

                      {/* Gross Earned */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-100">
                        {formatCurrency(totalGrossWage, currency)}
                      </td>

                      {/* Paid */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                        {formatCurrency(totalPaid, currency)}
                      </td>

                      {/* Outstanding Balance */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                        <span
                          className={
                            balanceDue > 0
                              ? 'text-amber-400'
                              : balanceDue === 0
                              ? 'text-slate-400'
                              : 'text-sky-400'
                          }
                        >
                          {formatCurrency(balanceDue, currency)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`capitalize text-[11px] ${
                            labour.status === 'active'
                              ? 'text-emerald-400'
                              : labour.status === 'on_leave'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {labour.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Action buttons: Edit, Delete, Payment, Pay Slip */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Disburse Payment */}
                          <button
                            type="button"
                            onClick={() => onOpenPaymentForLabour(labour)}
                            title="Record Payment"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          {/* Pay Slip */}
                          <button
                            type="button"
                            onClick={() => onSelectLabourForSlip(labour)}
                            title="Generate Pay Slip"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Labour */}
                          <button
                            type="button"
                            onClick={() => onOpenEditLabour(labour)}
                            title="Edit Labour Details"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete / Remove Labour */}
                          <button
                            type="button"
                            onClick={() => onConfirmDeleteLabour(labour)}
                            title="Remove Labourer"
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
