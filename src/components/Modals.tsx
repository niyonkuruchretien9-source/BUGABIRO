import React, { useState, useEffect } from 'react';
import { 
  Project, 
  Labour, 
  DailyAttendance, 
  LabourPayment, 
  ProjectExpense, 
  CurrencyCode, 
  WorkerRole,
  WageType,
  PaymentMethod,
  ExpenseCategory
} from '../types';
import { 
  formatCurrency, 
  CURRENCY_SYMBOLS, 
  computeLabourSummary 
} from '../utils/calculations';
import { CATEGORY_LABELS } from './ExpenseManager';
import { 
  X, 
  AlertTriangle, 
  Printer, 
  Check, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  Building2,
  Phone,
  Briefcase
} from 'lucide-react';

/* =========================================================================
   1. LABOUR MODAL (ADD & EDIT)
   ========================================================================= */
interface LabourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (labourData: Omit<Labour, 'id' | 'projectId'> & { id?: string }) => void;
  initialData?: Labour | null;
  currency: CurrencyCode;
}

const COMMON_ROLES: WorkerRole[] = [
  'Mason',
  'Carpenter',
  'Electrician',
  'Plumber',
  'Welder',
  'Steel Fixer',
  'Painter',
  'General Labourer',
  'Site Supervisor',
  'Heavy Equipment Operator',
  'Roofer',
  'Tile Setter',
  'Helper',
];

export const LabourModal: React.FC<LabourModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currency,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>('Mason');
  const [phone, setPhone] = useState('');
  const [wageType, setWageType] = useState<WageType>('hourly');
  const [defaultRate, setDefaultRate] = useState<number>(25);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);
  const [standardDailyHours, setStandardDailyHours] = useState<number>(8);
  const [status, setStatus] = useState<'active' | 'on_leave' | 'inactive'>('active');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRole(initialData.role);
      setPhone(initialData.phone);
      setWageType(initialData.wageType);
      setDefaultRate(initialData.defaultRate);
      setOvertimeMultiplier(initialData.overtimeMultiplier || 1.5);
      setStandardDailyHours(initialData.standardDailyHours || 8);
      setStatus(initialData.status);
      setEmergencyContact(initialData.emergencyContact || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setRole('Mason');
      setPhone('');
      setWageType('hourly');
      setDefaultRate(25);
      setOvertimeMultiplier(1.5);
      setStandardDailyHours(8);
      setStatus('active');
      setEmergencyContact('');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id,
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim() || '—',
      wageType,
      defaultRate: Number(defaultRate) || 0,
      overtimeMultiplier: Number(overtimeMultiplier) || 1.5,
      standardDailyHours: Number(standardDailyHours) || 8,
      status,
      emergencyContact: emergencyContact.trim(),
      joinedDate: initialData?.joinedDate || new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>{initialData ? 'Edit Labourer Profile' : 'Add New Labourer'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Full Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe, Carlos Mendoza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Trade / Role & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Trade / Specialty <span className="text-amber-400">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {COMMON_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 555-0192"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Wage Type & Default Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Wage Basis <span className="text-amber-400">*</span>
              </label>
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                <button
                  type="button"
                  onClick={() => setWageType('hourly')}
                  className={`flex-1 py-1.5 font-semibold text-xs transition-colors ${
                    wageType === 'hourly'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Hourly Rate
                </button>
                <button
                  type="button"
                  onClick={() => setWageType('daily')}
                  className={`flex-1 py-1.5 font-semibold text-xs transition-colors ${
                    wageType === 'daily'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Daily Fixed Rate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Rate ({CURRENCY_SYMBOLS[currency]} / {wageType === 'hourly' ? 'hr' : 'day'}) <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={defaultRate}
                onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Overtime Multiplier & Standard Daily Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Overtime Multiplier
              </label>
              <select
                value={overtimeMultiplier}
                onChange={(e) => setOvertimeMultiplier(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer font-mono"
              >
                <option value={1.0}>1.0x (Standard rate)</option>
                <option value={1.25}>1.25x (Time & quarter)</option>
                <option value={1.5}>1.5x (Time & half - Standard)</option>
                <option value={2.0}>2.0x (Double time)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Standard Daily Hours
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={standardDailyHours}
                onChange={(e) => setStandardDailyHours(parseInt(e.target.value) || 8)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Status & Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Status on Project
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="active">Active (On Project)</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive / Relieved</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Emergency Contact
              </label>
              <input
                type="text"
                placeholder="Name & Contact number"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Notes / Certifications
            </label>
            <input
              type="text"
              placeholder="e.g. Scaffolding certified, OSHA card, specialized equipment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shadow-amber-500/20 font-bold"
            >
              {initialData ? 'Save Changes' : 'Add Labourer to Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   2. CONFIRM DELETE MODAL
   ========================================================================= */
interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors font-bold"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. EXPENSE MODAL (ADD & EDIT)
   ========================================================================= */
interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<ProjectExpense, 'id' | 'projectId'> & { id?: string }) => void;
  initialData?: ProjectExpense | null;
  currency: CurrencyCode;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currency,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('materials');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>('2026-09-29');
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [receiptRef, setReceiptRef] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setAmount(initialData.amount);
      setDate(initialData.date);
      setVendor(initialData.vendor || '');
      setPaymentMethod(initialData.paymentMethod || 'bank_transfer');
      setReceiptRef(initialData.receiptRef || '');
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setCategory('materials');
      setAmount(0);
      setDate('2026-09-29');
      setVendor('');
      setPaymentMethod('bank_transfer');
      setReceiptRef('');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    onSave({
      id: initialData?.id,
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      vendor: vendor.trim(),
      paymentMethod,
      receiptRef: receiptRef.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            <span>{initialData ? 'Edit Expense Entry' : 'Record Project Expense'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Expense Description <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 35 Bags of Portland Cement, Excavator Diesel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Category <span className="text-amber-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Amount ({CURRENCY_SYMBOLS[currency]}) <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Date Incurred <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Vendor / Supplier Name
              </label>
              <input
                type="text"
                placeholder="e.g. Vulcan Materials, TotalEnergies"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="bank_transfer">Bank Wire / Transfer</option>
                <option value="cash">Petty Cash</option>
                <option value="mobile_money">Mobile Money (M-Pesa/Airtel)</option>
                <option value="check">Check / Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Receipt / Invoice #
              </label>
              <input
                type="text"
                placeholder="e.g. INV-9042, RCT-103"
                value={receiptRef}
                onChange={(e) => setReceiptRef(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Notes & Technical Specs
            </label>
            <input
              type="text"
              placeholder="e.g. Grade 30 concrete mix, 10-wheel tipper delivery fee included"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shadow-amber-500/20 font-bold"
            >
              {initialData ? 'Update Expense' : 'Save Expense Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   4. PAYMENT RECORD MODAL
   ========================================================================= */
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: Omit<LabourPayment, 'id' | 'projectId'>) => void;
  labours: Labour[];
  preselectedLabour?: Labour | null;
  currency: CurrencyCode;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  labours,
  preselectedLabour,
  currency,
}) => {
  const [labourId, setLabourId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>('2026-09-29');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [advanceDeduction, setAdvanceDeduction] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [payPeriod, setPayPeriod] = useState('Current Week');

  useEffect(() => {
    if (preselectedLabour) {
      setLabourId(preselectedLabour.id);
    } else if (labours.length > 0 && !labourId) {
      setLabourId(labours[0].id);
    }
  }, [preselectedLabour, labours, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labourId || amount <= 0) return;

    onSave({
      labourId,
      date,
      amount: Number(amount),
      paymentMethod,
      referenceNo: referenceNo.trim() || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      advanceDeduction: Number(advanceDeduction) || 0,
      notes: notes.trim(),
      payPeriod: payPeriod.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Disburse Labour Payment</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Select Worker <span className="text-amber-400">*</span>
            </label>
            <select
              required
              value={labourId}
              onChange={(e) => setLabourId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {labours.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.role} ({CURRENCY_SYMBOLS[currency]}{l.defaultRate}/{l.wageType === 'hourly' ? 'hr' : 'day'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Disbursed Amount ({CURRENCY_SYMBOLS[currency]}) <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Payment Date <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Disbursal Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="cash">Cash on Site</option>
                <option value="bank_transfer">Bank Wire</option>
                <option value="mobile_money">Mobile Money (M-Pesa / Mobile Pay)</option>
                <option value="check">Check / Voucher</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Voucher / Reference No.
              </label>
              <input
                type="text"
                placeholder="e.g. VCH-0043, TXN-9210"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Pay Period / Cycle
              </label>
              <input
                type="text"
                placeholder="e.g. Sep 22 - Sep 28"
                value={payPeriod}
                onChange={(e) => setPayPeriod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Advance Deductions Subtracted
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={advanceDeduction}
                onChange={(e) => setAdvanceDeduction(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Payment Memo / Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Handed cash in presence of foreman"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shadow-amber-500/20 font-bold"
            >
              Record Disbursal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   5. PROJECT CREATION / EDIT MODAL
   ========================================================================= */
interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projData: Omit<Project, 'id'> & { id?: string }) => void;
  initialData?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState<number>(50000);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [targetEndDate, setTargetEndDate] = useState('2026-12-31');
  const [status, setStatus] = useState<'active' | 'completed' | 'on_hold'>('active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setClient(initialData.client);
      setLocation(initialData.location);
      setBudget(initialData.budget);
      setCurrency(initialData.currency);
      setStartDate(initialData.startDate);
      setTargetEndDate(initialData.targetEndDate);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setCode(`PRJ-${Math.floor(100 + Math.random() * 900)}`);
      setClient('');
      setLocation('');
      setBudget(75000);
      setCurrency('USD');
      setStartDate(new Date().toISOString().slice(0, 10));
      setTargetEndDate('2026-12-31');
      setStatus('active');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id,
      name: name.trim(),
      code: code.trim(),
      client: client.trim() || 'Internal Project',
      location: location.trim() || 'Site Main',
      budget: Number(budget) || 0,
      currency,
      startDate,
      targetEndDate,
      status,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>{initialData ? 'Edit Project Details' : 'Create New Construction Project'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Project Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hilltop Medical Center Phase 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Project Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Client / Developer
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Holdings"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Site Location
            </label>
            <input
              type="text"
              placeholder="e.g. Plot 41, Sector 9, North Industrial Area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Budget Allocation
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="RWF">RWF (RWF)</option>
                <option value="KES">KES (KSh)</option>
                <option value="UGX">UGX (USh)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD (CA$)</option>
                <option value="AUD">AUD (AU$)</option>
                <option value="ZAR">ZAR (R)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-400 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Project Scope & Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Substructure, reinforcement, mechanical installation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shadow-amber-500/20 font-bold"
            >
              {initialData ? 'Save Changes' : 'Initialize Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   6. PRINTABLE PAY SLIP VOUCHER MODAL
   ========================================================================= */
interface PaySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  labour: Labour | null;
  attendances: DailyAttendance[];
  payments: LabourPayment[];
  currency: CurrencyCode;
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({
  isOpen,
  onClose,
  project,
  labour,
  attendances,
  payments,
  currency,
}) => {
  if (!isOpen || !labour) return null;

  const summary = computeLabourSummary(labour, attendances, payments);
  const workerAttendances = attendances
    .filter((a) => a.labourId === labour.id && a.projectId === project.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Worker Pay Slip & Attendance Record</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Pay Slip Sheet Container */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-100 bg-slate-900 print:bg-white print:text-slate-900 print-card">
          {/* Slip Header */}
          <div className="flex items-start justify-between border-b border-slate-700 pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white print:text-slate-950">
                LABOUR WAGE DISBURSAL VOUCHER
              </h1>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Project: <span className="font-semibold text-slate-200 print:text-slate-900">{project.name}</span> ({project.code})
              </p>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Site Location: {project.location}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-800 text-amber-400 print:bg-slate-100 print:text-slate-800 border border-slate-700">
                SLIP #{labour.id.toUpperCase()}-2026
              </span>
              <p className="text-[11px] text-slate-400 print:text-slate-500 mt-1.5">
                Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Worker Info Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 text-xs">
            <div>
              <p className="text-slate-400 print:text-slate-500">Worker Name</p>
              <p className="font-bold text-sm text-slate-100 print:text-slate-900 mt-0.5">{labour.name}</p>
            </div>
            <div>
              <p className="text-slate-400 print:text-slate-500">Role / Trade</p>
              <p className="font-semibold text-slate-200 print:text-slate-800 mt-0.5">{labour.role}</p>
            </div>
            <div>
              <p className="text-slate-400 print:text-slate-500">Wage Rate Basis</p>
              <p className="font-mono font-semibold text-slate-200 print:text-slate-800 mt-0.5">
                {formatCurrency(labour.defaultRate, currency)}/{labour.wageType === 'hourly' ? 'hr' : 'day'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 print:text-slate-500">Phone</p>
              <p className="font-mono text-slate-300 print:text-slate-700 mt-0.5">{labour.phone}</p>
            </div>
          </div>

          {/* Earnings Summary Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700">
              Hours & Wage Calculation Breakdown
            </h3>
            <div className="border border-slate-800 print:border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 print:bg-slate-100 border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Item / Description</th>
                    <th className="py-2 px-3 text-right">Units / Hours</th>
                    <th className="py-2 px-3 text-right">Applied Rate</th>
                    <th className="py-2 px-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-200 print:text-slate-800">
                      Standard Work Hours ({summary.daysPresent} full days, {summary.daysHalf} half days)
                    </td>
                    <td className="py-2 px-3 text-right">{summary.totalRegularHours} hrs</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(labour.defaultRate, currency)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-100 print:text-slate-900">
                      {formatCurrency(summary.totalGrossWage - (summary.totalOvertimeHours > 0 ? (summary.totalGrossWage * (summary.totalOvertimeHours / (summary.totalHours || 1))) : 0), currency)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-200 print:text-slate-800">
                      Overtime Work Hours (multiplier {labour.overtimeMultiplier}x)
                    </td>
                    <td className="py-2 px-3 text-right text-amber-400 print:text-amber-700 font-bold">
                      +{summary.totalOvertimeHours} hrs
                    </td>
                    <td className="py-2 px-3 text-right">
                      {labour.wageType === 'hourly'
                        ? formatCurrency(labour.defaultRate * labour.overtimeMultiplier, currency)
                        : formatCurrency((labour.defaultRate / 8) * labour.overtimeMultiplier, currency)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-amber-400 print:text-amber-800">
                      {/* Calculate OT subtotal */}
                      {formatCurrency(
                        summary.totalOvertimeHours *
                          (labour.wageType === 'hourly'
                            ? labour.defaultRate * labour.overtimeMultiplier
                            : (labour.defaultRate / 8) * labour.overtimeMultiplier),
                        currency
                      )}
                    </td>
                  </tr>
                  <tr className="bg-slate-950/40 print:bg-slate-50 font-bold">
                    <td className="py-2.5 px-3 font-sans text-slate-100 print:text-slate-900">
                      GROSS EARNED WAGES
                    </td>
                    <td className="py-2.5 px-3 text-right">{summary.totalHours} hrs</td>
                    <td className="py-2.5 px-3 text-right">—</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 print:text-emerald-700 text-sm">
                      {formatCurrency(summary.totalGrossWage, currency)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-300 print:text-slate-700">
                      Less: Total Advances / Prior Disbursals Paid
                    </td>
                    <td className="py-2 px-3 text-right">—</td>
                    <td className="py-2 px-3 text-right">—</td>
                    <td className="py-2 px-3 text-right text-emerald-400 print:text-emerald-700">
                      ({formatCurrency(summary.totalPaid, currency)})
                    </td>
                  </tr>
                  <tr className="bg-amber-500/10 print:bg-amber-50 font-bold text-sm">
                    <td className="py-3 px-3 font-sans text-amber-300 print:text-amber-900">
                      NET OUTSTANDING BALANCE DUE
                    </td>
                    <td className="py-3 px-3 text-right">—</td>
                    <td className="py-3 px-3 text-right">—</td>
                    <td className="py-3 px-3 text-right text-amber-400 print:text-amber-800 font-mono text-base">
                      {formatCurrency(summary.balanceDue, currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Recent Daily Logs */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
              Daily Attendance Logs Included ({workerAttendances.length} days)
            </h4>
            <div className="max-h-40 overflow-y-auto border border-slate-800 print:border-slate-300 rounded-lg text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 print:bg-slate-100 text-slate-400 print:text-slate-600">
                  <tr>
                    <th className="py-1 px-3">Date</th>
                    <th className="py-1 px-3">Status</th>
                    <th className="py-1 px-3 text-right">Reg. Hours</th>
                    <th className="py-1 px-3 text-right">OT Hours</th>
                    <th className="py-1 px-3 text-right">Daily Pay</th>
                    <th className="py-1 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200 font-mono">
                  {workerAttendances.map((a) => (
                    <tr key={a.id}>
                      <td className="py-1 px-3 text-slate-300 print:text-slate-700">{a.date}</td>
                      <td className="py-1 px-3 capitalize font-sans">{a.status.replace('_', ' ')}</td>
                      <td className="py-1 px-3 text-right">{a.regularHours}h</td>
                      <td className="py-1 px-3 text-right text-amber-400 print:text-amber-700">+{a.overtimeHours}h</td>
                      <td className="py-1 px-3 text-right font-bold">{formatCurrency(a.dailyWageCalculated, currency)}</td>
                      <td className="py-1 px-3 text-slate-400 print:text-slate-600 font-sans truncate max-w-xs">{a.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signatures Section */}
          <div className="pt-6 border-t border-slate-700 print:border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-8">
              <p className="text-slate-400 print:text-slate-600">
                Worker Acknowledgement: <br />
                <span className="text-[11px]">I confirm receipt and accuracy of the logged hours.</span>
              </p>
              <div className="border-b border-slate-600 print:border-slate-400 w-48" />
              <p className="font-semibold text-slate-200 print:text-slate-800">
                {labour.name} (Signature & Date)
              </p>
            </div>

            <div className="space-y-8 text-right">
              <p className="text-slate-400 print:text-slate-600">
                Site Supervisor / Authorized Paymaster: <br />
                <span className="text-[11px]">Verified on behalf of {project.name}.</span>
              </p>
              <div className="border-b border-slate-600 print:border-slate-400 w-48 ml-auto" />
              <p className="font-semibold text-slate-200 print:text-slate-800">
                Foreman / Project Manager
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
