import { Project, Labour, DailyAttendance, LabourPayment, ProjectExpense } from '../types';
import foremanAvatar from '../assets/images/avatar_foreman_mike_1790672233683.jpg';
import electricianAvatar from '../assets/images/avatar_electrician_sarah_1790672247311.jpg';
import masonAvatar from '../assets/images/avatar_mason_carlos_1790672259972.jpg';

const STORAGE_KEYS = {
  PROJECTS: 'buildpay_projects_v1',
  ACTIVE_PROJECT: 'buildpay_active_project_id_v1',
  LABOURS: 'buildpay_labours_v1',
  ATTENDANCE: 'buildpay_attendance_v1',
  PAYMENTS: 'buildpay_payments_v1',
  EXPENSES: 'buildpay_expenses_v1',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Skyline Commercial Plaza - Phase 2',
    code: 'SCP-2026',
    client: 'Apex Urban Developers',
    location: '450 Horizon Ave, Sector 4',
    budget: 85000,
    currency: 'USD',
    startDate: '2026-09-01',
    targetEndDate: '2026-11-30',
    status: 'active',
    notes: 'Ground excavation, foundation reinforced concrete pouring, and structural framing.',
  },
  {
    id: 'proj-2',
    name: 'Riverside Luxury Residences',
    code: 'RLR-104',
    client: 'Oakmont Living Properties',
    location: '12 Marina Bay Drive',
    budget: 125000,
    currency: 'USD',
    startDate: '2026-08-15',
    targetEndDate: '2026-12-20',
    status: 'active',
    notes: 'Premium residential build: interior finishing, cabinetry, and smart electrical cabling.',
  },
];

export const INITIAL_LABOURS: Labour[] = [
  {
    id: 'lab-1',
    projectId: 'proj-1',
    name: 'Mike Henderson',
    role: 'Site Supervisor',
    phone: '+1 (555) 234-8901',
    wageType: 'hourly',
    defaultRate: 32,
    overtimeMultiplier: 1.5,
    standardDailyHours: 8,
    status: 'active',
    avatarUrl: foremanAvatar,
    joinedDate: '2026-09-01',
    emergencyContact: 'Linda Henderson (+1 555-234-8909)',
    notes: 'OSHA 30 certified, site safety & crew coordination.',
  },
  {
    id: 'lab-2',
    projectId: 'proj-1',
    name: 'Carlos Mendoza',
    role: 'Mason',
    phone: '+1 (555) 345-6712',
    wageType: 'hourly',
    defaultRate: 25,
    overtimeMultiplier: 1.5,
    standardDailyHours: 8,
    status: 'active',
    avatarUrl: masonAvatar,
    joinedDate: '2026-09-02',
    emergencyContact: 'Maria Mendoza (+1 555-345-6799)',
    notes: 'Brickwork, block masonry, and concrete finish expert.',
  },
  {
    id: 'lab-3',
    projectId: 'proj-1',
    name: 'Sarah Lin',
    role: 'Electrician',
    phone: '+1 (555) 456-7823',
    wageType: 'hourly',
    defaultRate: 28,
    overtimeMultiplier: 1.5,
    standardDailyHours: 8,
    status: 'active',
    avatarUrl: electricianAvatar,
    joinedDate: '2026-09-03',
    emergencyContact: 'Kevin Lin (+1 555-456-7890)',
    notes: 'Licensed commercial electrician, subpanel & conduit installation.',
  },
  {
    id: 'lab-4',
    projectId: 'proj-1',
    name: 'James O’Connor',
    role: 'Carpenter',
    phone: '+1 (555) 567-8934',
    wageType: 'hourly',
    defaultRate: 26,
    overtimeMultiplier: 1.5,
    standardDailyHours: 8,
    status: 'active',
    joinedDate: '2026-09-04',
    emergencyContact: 'Claire O’Connor (+1 555-567-8999)',
    notes: 'Formwork carpentry and roof structural trusses.',
  },
  {
    id: 'lab-5',
    projectId: 'proj-1',
    name: 'David K. Mwangi',
    role: 'Steel Fixer',
    phone: '+1 (555) 678-9045',
    wageType: 'daily',
    defaultRate: 210,
    overtimeMultiplier: 1.5,
    standardDailyHours: 8,
    status: 'active',
    joinedDate: '2026-09-05',
    emergencyContact: 'Grace Mwangi (+1 555-678-9000)',
    notes: 'Rebar fabrication, bending, and foundation mesh fixing.',
  },
  {
    id: 'lab-6',
    projectId: 'proj-1',
    name: 'Samuel Adeyemi',
    role: 'General Labourer',
    phone: '+1 (555) 789-0156',
    wageType: 'daily',
    defaultRate: 150,
    overtimeMultiplier: 1.5,
    standardDailyHours: 8,
    status: 'active',
    joinedDate: '2026-09-05',
    emergencyContact: 'Tunde Adeyemi (+1 555-789-0111)',
    notes: 'Material handling, concrete batching assistance, and site clearing.',
  },
  // Project 2 worker
  {
    id: 'lab-7',
    projectId: 'proj-2',
    name: 'Marcus Bell',
    role: 'Plumber',
    phone: '+1 (555) 890-1267',
    wageType: 'hourly',
    defaultRate: 29,
    overtimeMultiplier: 1.5,
    standardDailyHours: 8,
    status: 'active',
    joinedDate: '2026-08-20',
    emergencyContact: 'Rachel Bell (+1 555-890-1200)',
    notes: 'Rough-in plumbing, PEX piping, drainage lines.',
  },
];

export const INITIAL_ATTENDANCE: DailyAttendance[] = [
  // 2026-09-27
  {
    id: 'att-1',
    projectId: 'proj-1',
    labourId: 'lab-1',
    date: '2026-09-27',
    status: 'present',
    regularHours: 8,
    overtimeHours: 2,
    hourlyRateApplied: 32,
    overtimeRateApplied: 48,
    dailyWageCalculated: 352, // 256 + 96
    notes: 'Morning site inspection and evening subcontractor handover',
    verified: true,
  },
  {
    id: 'att-2',
    projectId: 'proj-1',
    labourId: 'lab-2',
    date: '2026-09-27',
    status: 'present',
    regularHours: 8,
    overtimeHours: 1.5,
    hourlyRateApplied: 25,
    overtimeRateApplied: 37.5,
    dailyWageCalculated: 256.25, // 200 + 56.25
    notes: 'Perimeter footing brick laying',
    verified: true,
  },
  {
    id: 'att-3',
    projectId: 'proj-1',
    labourId: 'lab-3',
    date: '2026-09-27',
    status: 'present',
    regularHours: 8,
    overtimeHours: 0,
    hourlyRateApplied: 28,
    overtimeRateApplied: 42,
    dailyWageCalculated: 224,
    notes: 'Main distribution breaker conduit placement',
    verified: true,
  },
  {
    id: 'att-4',
    projectId: 'proj-1',
    labourId: 'lab-4',
    date: '2026-09-27',
    status: 'present',
    regularHours: 8,
    overtimeHours: 2,
    hourlyRateApplied: 26,
    overtimeRateApplied: 39,
    dailyWageCalculated: 286, // 208 + 78
    notes: 'Concrete formwork preparation for slab',
    verified: true,
  },
  {
    id: 'att-5',
    projectId: 'proj-1',
    labourId: 'lab-5',
    date: '2026-09-27',
    status: 'present',
    regularHours: 8,
    overtimeHours: 1,
    hourlyRateApplied: 210,
    overtimeRateApplied: 39.38,
    dailyWageCalculated: 249.38,
    notes: 'Tied columns 1 through 8',
    verified: true,
  },
  {
    id: 'att-6',
    projectId: 'proj-1',
    labourId: 'lab-6',
    date: '2026-09-27',
    status: 'present',
    regularHours: 8,
    overtimeHours: 0,
    hourlyRateApplied: 150,
    overtimeRateApplied: 28.13,
    dailyWageCalculated: 150,
    notes: 'Aggregate moving & clean-up',
    verified: true,
  },

  // 2026-09-28
  {
    id: 'att-7',
    projectId: 'proj-1',
    labourId: 'lab-1',
    date: '2026-09-28',
    status: 'present',
    regularHours: 8,
    overtimeHours: 1,
    hourlyRateApplied: 32,
    overtimeRateApplied: 48,
    dailyWageCalculated: 304,
    notes: 'Ready-mix concrete delivery inspection',
    verified: true,
  },
  {
    id: 'att-8',
    projectId: 'proj-1',
    labourId: 'lab-2',
    date: '2026-09-28',
    status: 'present',
    regularHours: 8,
    overtimeHours: 2,
    hourlyRateApplied: 25,
    overtimeRateApplied: 37.5,
    dailyWageCalculated: 275,
    notes: 'Assisted in concrete level smoothing',
    verified: true,
  },
  {
    id: 'att-9',
    projectId: 'proj-1',
    labourId: 'lab-3',
    date: '2026-09-28',
    status: 'half_day',
    regularHours: 4,
    overtimeHours: 0,
    hourlyRateApplied: 28,
    overtimeRateApplied: 42,
    dailyWageCalculated: 112,
    notes: 'Medical appointment in afternoon',
    verified: true,
  },
  {
    id: 'att-10',
    projectId: 'proj-1',
    labourId: 'lab-4',
    date: '2026-09-28',
    status: 'present',
    regularHours: 8,
    overtimeHours: 2.5,
    hourlyRateApplied: 26,
    overtimeRateApplied: 39,
    dailyWageCalculated: 305.5,
    notes: 'Bracing and scaffolding setup',
    verified: true,
  },
  {
    id: 'att-11',
    projectId: 'proj-1',
    labourId: 'lab-5',
    date: '2026-09-28',
    status: 'present',
    regularHours: 8,
    overtimeHours: 2,
    hourlyRateApplied: 210,
    overtimeRateApplied: 39.38,
    dailyWageCalculated: 288.76,
    notes: 'Overtime rebar ties during concrete pour',
    verified: true,
  },
  {
    id: 'att-12',
    projectId: 'proj-1',
    labourId: 'lab-6',
    date: '2026-09-28',
    status: 'present',
    regularHours: 8,
    overtimeHours: 1.5,
    hourlyRateApplied: 150,
    overtimeRateApplied: 28.13,
    dailyWageCalculated: 192.2,
    notes: 'Concrete vibrator assistant',
    verified: true,
  },

  // 2026-09-29 (Today)
  {
    id: 'att-13',
    projectId: 'proj-1',
    labourId: 'lab-1',
    date: '2026-09-29',
    status: 'present',
    regularHours: 8,
    overtimeHours: 0,
    hourlyRateApplied: 32,
    overtimeRateApplied: 48,
    dailyWageCalculated: 256,
    notes: 'Daily safety toolbox talk & progress logging',
    verified: false,
  },
  {
    id: 'att-14',
    projectId: 'proj-1',
    labourId: 'lab-2',
    date: '2026-09-29',
    status: 'present',
    regularHours: 8,
    overtimeHours: 0,
    hourlyRateApplied: 25,
    overtimeRateApplied: 37.5,
    dailyWageCalculated: 200,
    notes: 'South wall brick layout',
    verified: false,
  },
  {
    id: 'att-15',
    projectId: 'proj-1',
    labourId: 'lab-3',
    date: '2026-09-29',
    status: 'present',
    regularHours: 8,
    overtimeHours: 1,
    hourlyRateApplied: 28,
    overtimeRateApplied: 42,
    dailyWageCalculated: 266,
    notes: 'Grounding rod inspection & wire pull',
    verified: false,
  },
  {
    id: 'att-16',
    projectId: 'proj-1',
    labourId: 'lab-4',
    date: '2026-09-29',
    status: 'present',
    regularHours: 8,
    overtimeHours: 0,
    hourlyRateApplied: 26,
    overtimeRateApplied: 39,
    dailyWageCalculated: 208,
    notes: 'Stripping cure forms',
    verified: false,
  },
  {
    id: 'att-17',
    projectId: 'proj-1',
    labourId: 'lab-5',
    date: '2026-09-29',
    status: 'present',
    regularHours: 8,
    overtimeHours: 0,
    hourlyRateApplied: 210,
    overtimeRateApplied: 39.38,
    dailyWageCalculated: 210,
    notes: 'Upper deck rebar placement',
    verified: false,
  },
  {
    id: 'att-18',
    projectId: 'proj-1',
    labourId: 'lab-6',
    date: '2026-09-29',
    status: 'present',
    regularHours: 8,
    overtimeHours: 0,
    hourlyRateApplied: 150,
    overtimeRateApplied: 28.13,
    dailyWageCalculated: 150,
    notes: 'General material organization',
    verified: false,
  },
];

export const INITIAL_PAYMENTS: LabourPayment[] = [
  {
    id: 'pay-1',
    projectId: 'proj-1',
    labourId: 'lab-1',
    date: '2026-09-28',
    amount: 500,
    paymentMethod: 'bank_transfer',
    referenceNo: 'TXN-902148',
    notes: 'Weekly advance payment',
    payPeriod: 'Sep 21 - Sep 27',
  },
  {
    id: 'pay-2',
    projectId: 'proj-1',
    labourId: 'lab-2',
    date: '2026-09-28',
    amount: 350,
    paymentMethod: 'cash',
    referenceNo: 'VCH-0041',
    notes: 'Advance wage payout',
    payPeriod: 'Sep 21 - Sep 27',
  },
  {
    id: 'pay-3',
    projectId: 'proj-1',
    labourId: 'lab-5',
    date: '2026-09-28',
    amount: 400,
    paymentMethod: 'mobile_money',
    referenceNo: 'MMP-78103',
    notes: 'Mobile money disbursement',
    payPeriod: 'Sep 21 - Sep 27',
  },
  {
    id: 'pay-4',
    projectId: 'proj-1',
    labourId: 'lab-6',
    date: '2026-09-28',
    amount: 250,
    paymentMethod: 'cash',
    referenceNo: 'VCH-0042',
    notes: 'Cash payout on site',
    payPeriod: 'Sep 21 - Sep 27',
  },
];

export const INITIAL_EXPENSES: ProjectExpense[] = [
  {
    id: 'exp-1',
    projectId: 'proj-1',
    title: 'Ready-Mix Concrete Batch (35 Cubic Metres)',
    category: 'materials',
    amount: 4950,
    date: '2026-09-26',
    vendor: 'Vulcan Materials & Concrete Co.',
    paymentMethod: 'bank_transfer',
    receiptRef: 'INV-48920',
    notes: 'Grade 30 concrete for main structural foundation',
  },
  {
    id: 'exp-2',
    projectId: 'proj-1',
    title: 'Excavator & Boom Pump Rental (3 Days)',
    category: 'equipment_rental',
    amount: 2400,
    date: '2026-09-25',
    vendor: 'United Heavy Plant Hire',
    paymentMethod: 'bank_transfer',
    receiptRef: 'RNT-8812',
    notes: 'Includes operator fuel surcharge & delivery',
  },
  {
    id: 'exp-3',
    projectId: 'proj-1',
    title: 'High-Tensile Steel Rebar (4.5 Tonnes)',
    category: 'materials',
    amount: 3820,
    date: '2026-09-24',
    vendor: 'Titan Steel Reinforcement Ltd',
    paymentMethod: 'bank_transfer',
    receiptRef: 'INV-7731',
    notes: '12mm & 16mm deformed high yield bars',
  },
  {
    id: 'exp-4',
    projectId: 'proj-1',
    title: 'Diesel Fuel for Generator & Site Compactor',
    category: 'transport_fuel',
    amount: 420,
    date: '2026-09-27',
    vendor: 'TotalEnergies Commercial',
    paymentMethod: 'cash',
    receiptRef: 'PET-0994',
    notes: '350 Litres red diesel delivered to site tank',
  },
  {
    id: 'exp-5',
    projectId: 'proj-1',
    title: 'Crew Drinking Water & Electrolyte Supplies',
    category: 'catering_water',
    amount: 145,
    date: '2026-09-28',
    vendor: 'ClearSprings Wholesale Dist',
    paymentMethod: 'cash',
    receiptRef: 'RCT-2104',
    notes: 'Weekly palletized 20L water carboys & dispenser cups',
  },
  {
    id: 'exp-6',
    projectId: 'proj-1',
    title: 'Safety Helmets, High-Vis Vests, and Work Gloves',
    category: 'safety_gear',
    amount: 380,
    date: '2026-09-22',
    vendor: 'Grainger Industrial Safety',
    paymentMethod: 'bank_transfer',
    receiptRef: 'PO-3301',
    notes: 'PPE kit replenishment for new crew members',
  },
  {
    id: 'exp-7',
    projectId: 'proj-1',
    title: 'Municipal Building Permit Stage 2 Inspection',
    category: 'permits_licenses',
    amount: 850,
    date: '2026-09-18',
    vendor: 'City Planning & Structural Safety Bureau',
    paymentMethod: 'bank_transfer',
    receiptRef: 'GOV-PM-902',
    notes: 'Foundation inspection and sign-off fee',
  },
];

// Helper to load or initialize from localStorage
export function loadFromStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed reading ${key} from storage:`, e);
    return defaultVal;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed saving ${key} to storage:`, e);
  }
}

export { STORAGE_KEYS };

// CSV Export helpers
export function exportAttendanceToCSV(
  attendances: DailyAttendance[],
  labours: Labour[],
  projectName: string
): void {
  const labourMap = new Map(labours.map((l) => [l.id, l]));

  const headers = [
    'Date',
    'Worker Name',
    'Role / Trade',
    'Status',
    'Regular Hours',
    'Overtime Hours',
    'Total Hours',
    'Hourly / Daily Rate',
    'Calculated Daily Wage',
    'Notes',
  ];

  const rows = attendances.map((att) => {
    const lab = labourMap.get(att.labourId);
    return [
      att.date,
      `"${lab?.name || 'Unknown'}"`,
      `"${lab?.role || ''}"`,
      att.status,
      att.regularHours,
      att.overtimeHours,
      att.regularHours + att.overtimeHours,
      att.hourlyRateApplied,
      att.dailyWageCalculated,
      `"${(att.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(csvContent, `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Timesheets.csv`);
}

export function exportExpensesToCSV(expenses: ProjectExpense[], projectName: string): void {
  const headers = ['Date', 'Title', 'Category', 'Amount', 'Vendor', 'Payment Method', 'Receipt Ref', 'Notes'];

  const rows = expenses.map((exp) => [
    exp.date,
    `"${exp.title.replace(/"/g, '""')}"`,
    exp.category,
    exp.amount,
    `"${(exp.vendor || '').replace(/"/g, '""')}"`,
    exp.paymentMethod,
    `"${(exp.receiptRef || '').replace(/"/g, '""')}"`,
    `"${(exp.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(csvContent, `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Expenses.csv`);
}

function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
