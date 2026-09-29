export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'RWF' | 'KES' | 'UGX' | 'INR' | 'CAD' | 'AUD' | 'ZAR';

export interface Project {
  id: string;
  name: string;
  code: string;
  client: string;
  location: string;
  budget: number;
  currency: CurrencyCode;
  startDate: string;
  targetEndDate: string;
  status: 'active' | 'completed' | 'on_hold';
  notes?: string;
}

export type WageType = 'hourly' | 'daily';

export type WorkerRole = 
  | 'Mason'
  | 'Carpenter'
  | 'Electrician'
  | 'Plumber'
  | 'Welder'
  | 'Painter'
  | 'Steel Fixer'
  | 'General Labourer'
  | 'Site Supervisor'
  | 'Heavy Equipment Operator'
  | 'Roofer'
  | 'Tile Setter'
  | 'Helper';

export interface Labour {
  id: string;
  projectId: string;
  name: string;
  role: WorkerRole | string;
  phone: string;
  wageType: WageType;
  defaultRate: number; // hourly rate or daily rate
  overtimeMultiplier: number; // e.g. 1.5x
  standardDailyHours: number; // usually 8
  status: 'active' | 'on_leave' | 'inactive';
  avatarUrl?: string;
  joinedDate: string;
  emergencyContact?: string;
  notes?: string;
}

export type AttendanceStatus = 'present' | 'half_day' | 'absent' | 'leave';

export interface DailyAttendance {
  id: string;
  projectId: string;
  labourId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  regularHours: number;
  overtimeHours: number;
  hourlyRateApplied: number;
  overtimeRateApplied: number;
  dailyWageCalculated: number;
  notes?: string;
  verified?: boolean;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'check';

export interface LabourPayment {
  id: string;
  projectId: string;
  labourId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  advanceDeduction?: number;
  notes?: string;
  payPeriod?: string;
}

export type ExpenseCategory = 
  | 'materials'
  | 'equipment_rental'
  | 'transport_fuel'
  | 'subcontractor'
  | 'safety_gear'
  | 'permits_licenses'
  | 'utilities'
  | 'catering_water'
  | 'site_supplies'
  | 'misc';

export interface ProjectExpense {
  id: string;
  projectId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  vendor?: string;
  paymentMethod: PaymentMethod;
  receiptRef?: string;
  notes?: string;
}

export interface LabourSummary {
  labour: Labour;
  daysPresent: number;
  daysHalf: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalHours: number;
  totalGrossWage: number;
  totalPaid: number;
  totalAdvancesDeducted: number;
  netPaid: number;
  balanceDue: number;
}
