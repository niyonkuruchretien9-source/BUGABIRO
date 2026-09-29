/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePWAInstall, useOnlineStatus } from './hooks/usePWAInstall';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { 
  Users, 
  UserPlus, 
  Printer, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Search, 
  Trash2, 
  Edit3, 
  Building2, 
  Check, 
  Smartphone, 
  X, 
  Phone, 
  Copy, 
  FileText, 
  ChevronDown, 
  DollarSign, 
  Send, 
  CreditCard, 
  CheckCircle2, 
  Wallet, 
  Clock,
  Cloud,
  Share2
} from 'lucide-react';

export type PaymentMethod = 'momo' | 'airtel' | 'cash' | 'bank';
export type PaymentStatus = 'pending' | 'paid';

export interface EmployeeItem {
  id: string;
  name: string;
  phone: string;
  amount: number;
  trade?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paidAt?: string;
  paymentRef?: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  location?: string;
  employees: EmployeeItem[];
}

// 17 Default Rwandan Workers
const DEFAULT_EMPLOYEES_RAW: [string, string, number, string][] = [
  ["Ntezimana", "0783962754", 28000, "Mason (Umwubatsi)"],
  ["Jean Pierre", "0785260601", 15000, "Helper (Umufundi)"],
  ["Emmanuel", "0783024113", 15000, "Site Foreman (Kapita)"],
  ["Nsengiyaremye", "0782879583", 14000, "Carpenter (Umubaji)"],
  ["Iradukunda", "0791554174", 14000, "Steel Fixer (Umusode)"],
  ["Habineza", "0796831617", 14000, "Painter (Umurangi)"],
  ["Ndayisenga", "0783102852", 10000, "Mason (Umwubatsi)"],
  ["Venuste", "0795864617", 10000, "Electrician"],
  ["Daniel", "0781022720", 5000, "General Labor"],
  ["Martin", "0785103642", 5000, "General Labor"],
  ["Giraneza", "0784613267", 5000, "General Labor"],
  ["Ntambara", "0782343072", 5000, "General Labor"],
  ["Manirambona", "0786206078", 5000, "General Labor"],
  ["Ndatimana", "0780850789", 5000, "General Labor"],
  ["Ndikubwayo", "0792100416", 5000, "General Labor"],
  ["Nakabonye", "0780487031", 5000, "General Labor"],
  ["Twajeneza", "0792283241", 2500, "Site Cleaning"]
];

export function getCarrierInfo(phone: string) {
  const clean = (phone || '').replace(/[^0-9]/g, '');
  if (
    clean.startsWith('078') ||
    clean.startsWith('079') ||
    clean.includes('25078') ||
    clean.includes('25079')
  ) {
    return {
      name: 'MTN Mobile Money',
      short: 'MTN MoMo',
      code: '*182#',
      carrier: 'momo' as const,
      color: 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200',
      badgeBg: 'bg-amber-500 text-slate-950',
      btnClass: 'btn-3d-momo',
      ussdPrefix: '*182*1*1*',
    };
  }
  if (
    clean.startsWith('072') ||
    clean.startsWith('073') ||
    clean.includes('25072') ||
    clean.includes('25073')
  ) {
    return {
      name: 'Airtel Money (E-Kash)',
      short: 'Airtel E-Kash',
      code: '*182# / *500#',
      carrier: 'airtel' as const,
      color: 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200',
      badgeBg: 'bg-rose-600 text-white',
      btnClass: 'btn-3d-airtel',
      ussdPrefix: '*182*1*1*',
    };
  }
  return {
    name: 'Mobile Money',
    short: 'MTN MoMo',
    code: '*182#',
    carrier: 'momo' as const,
    color: 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200',
    badgeBg: 'bg-amber-500 text-slate-950',
    btnClass: 'btn-3d-momo',
    ussdPrefix: '*182*1*1*',
  };
}

function initDefaultEmployees(): EmployeeItem[] {
  return DEFAULT_EMPLOYEES_RAW.map(([name, phone, amount, trade], idx) => {
    const carrier = getCarrierInfo(phone).carrier;
    return {
      id: `emp-${idx + 1}`,
      name,
      phone,
      amount,
      trade,
      paymentMethod: carrier,
      paymentStatus: idx === 0 ? 'paid' : 'pending',
      paidAt: idx === 0 ? new Date().toLocaleDateString() : undefined,
      paymentRef: idx === 0 ? 'MOMO-783962' : undefined,
    };
  });
}

const STORAGE_PROJECTS_KEY = 'abakozi_clean_white_v6';
const STORAGE_ACTIVE_PROJ_KEY = 'abakozi_clean_active_v6';

export default function App() {
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Projects State
  const [projects, setProjects] = useState<ProjectRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }

    return [
      {
        id: 'proj-1',
        name: 'Kigali Commercial Complex',
        location: 'Nyarugenge Sector, Kigali',
        employees: initDefaultEmployees(),
      },
    ];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_ACTIVE_PROJ_KEY) || 'proj-1';
    } catch {
      return 'proj-1';
    }
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [syncStatusText, setSyncStatusText] = useState<string>('Connecting to live database...');

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || {
      id: 'proj-1',
      name: 'Site Project',
      location: 'Rwanda',
      employees: [],
    };
  }, [projects, activeProjectId]);

  // =========================================================================
  // REAL-TIME FIRESTORE SYNCHRONIZATION ACROSS ALL PHONES
  // =========================================================================
  useEffect(() => {
    const docRef = doc(db, 'projects', activeProjectId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          if (remoteData && remoteData.employees) {
            setProjects((prev) => {
              const exists = prev.some((p) => p.id === activeProjectId);
              if (exists) {
                return prev.map((p) =>
                  p.id === activeProjectId
                    ? {
                        ...p,
                        name: remoteData.name || p.name,
                        location: remoteData.location || p.location,
                        employees: remoteData.employees || [],
                      }
                    : p
                );
              } else {
                return [
                  ...prev,
                  {
                    id: activeProjectId,
                    name: remoteData.name || 'Site Project',
                    location: remoteData.location || 'Rwanda',
                    employees: remoteData.employees || [],
                  },
                ];
              }
            });
            setIsCloudSynced(true);
            setSyncStatusText('Real-Time Live Sync Active');
          }
        } else {
          // Document does not exist in Firestore yet: seed current active project
          const seedData = {
            name: activeProject.name,
            location: activeProject.location || 'Rwanda',
            employees: activeProject.employees,
            updatedAt: new Date().toISOString(),
          };
          setDoc(docRef, seedData, { merge: true })
            .then(() => {
              setIsCloudSynced(true);
              setSyncStatusText('Real-Time Live Sync Active');
            })
            .catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, `projects/${activeProjectId}`);
            });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `projects/${activeProjectId}`);
        setIsCloudSynced(false);
        setSyncStatusText('Offline cache mode');
      }
    );

    return () => unsubscribe();
  }, [activeProjectId]);

  // Persist to localStorage and sync mutations to Firestore
  const syncToFirestore = async (updatedProject: ProjectRecord) => {
    try {
      const docRef = doc(db, 'projects', updatedProject.id);
      await setDoc(
        docRef,
        {
          name: updatedProject.name,
          location: updatedProject.location || 'Rwanda',
          employees: updatedProject.employees,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setIsCloudSynced(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${updatedProject.id}`);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
      localStorage.setItem(STORAGE_ACTIVE_PROJ_KEY, activeProjectId);
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }, [projects, activeProjectId]);

  // Search, Sorting & Payment Status Filter
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'default' | 'amount-high' | 'amount-low' | 'name'>('default');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'paid'>('all');

  // Delete Target Modal
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    amount?: number;
    trade?: string;
  } | null>(null);

  // Payment Options Modal Target
  const [paymentTarget, setPaymentTarget] = useState<{
    id: string;
    name: string;
    phone: string;
    amount: number;
    trade?: string;
    currentStatus: PaymentStatus;
    currentMethod?: PaymentMethod;
    paidAt?: string;
    paymentRef?: string;
  } | null>(null);

  // Form Modal state (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EmployeeItem | null>(null);

  // Form Inputs
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formTrade, setFormTrade] = useState('Mason (Umwubatsi)');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('momo');
  const [formPaymentStatus, setFormPaymentStatus] = useState<PaymentStatus>('pending');

  // Pay Voucher Modal
  const [voucherEmp, setVoucherEmp] = useState<EmployeeItem | null>(null);

  // Project Switch / Add Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const money = (n: number) => {
    return Number(n || 0).toLocaleString('en-US') + ' Frw';
  };

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = (activeProject.employees || []).filter((e) => {
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        (e.trade && e.trade.toLowerCase().includes(q));
      const matchesPayment =
        paymentFilter === 'all' ||
        (paymentFilter === 'paid' && e.paymentStatus === 'paid') ||
        (paymentFilter === 'pending' && e.paymentStatus !== 'paid');
      return matchesSearch && matchesPayment;
    });

    if (sort === 'amount-high') list = [...list].sort((a, b) => b.amount - a.amount);
    if (sort === 'amount-low') list = [...list].sort((a, b) => a.amount - b.amount);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [activeProject.employees, search, sort, paymentFilter]);

  // Financial Aggregates
  const totalWages = useMemo(() => {
    return (activeProject.employees || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [activeProject.employees]);

  const totalPaid = useMemo(() => {
    return (activeProject.employees || [])
      .filter((e) => e.paymentStatus === 'paid')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [activeProject.employees]);

  const totalPending = totalWages - totalPaid;

  const countPaid = useMemo(() => {
    return (activeProject.employees || []).filter((e) => e.paymentStatus === 'paid').length;
  }, [activeProject.employees]);

  const countPending = (activeProject.employees || []).length - countPaid;

  // Handlers for Add/Edit
  const handleOpenAddEmployee = () => {
    setEditItem(null);
    setFormName('');
    setFormPhone('');
    setFormAmount(15000);
    setFormTrade('Mason (Umwubatsi)');
    setFormPaymentMethod('momo');
    setFormPaymentStatus('pending');
    setIsModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: EmployeeItem) => {
    setEditItem(emp);
    setFormName(emp.name);
    setFormPhone(emp.phone);
    setFormAmount(emp.amount);
    setFormTrade(emp.trade || 'General Labor');
    setFormPaymentMethod(emp.paymentMethod || getCarrierInfo(emp.phone).carrier);
    setFormPaymentStatus(emp.paymentStatus || 'pending');
    setIsModalOpen(true);
  };

  // Save Form and broadcast to other phones
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    const phone = formPhone.trim();
    const amount = Number(formAmount) || 0;

    if (!name) {
      showToast('⚠️ Please enter a name');
      return;
    }

    let updatedEmployees: EmployeeItem[] = [];

    if (editItem) {
      updatedEmployees = activeProject.employees.map((emp) =>
        emp.id === editItem.id
          ? {
              ...emp,
              name,
              phone,
              amount,
              trade: formTrade,
              paymentMethod: formPaymentMethod,
              paymentStatus: formPaymentStatus,
            }
          : emp
      );
      showToast(`✅ Updated worker ${name}`);
    } else {
      const newEmp: EmployeeItem = {
        id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        phone,
        amount,
        trade: formTrade,
        paymentMethod: formPaymentMethod,
        paymentStatus: formPaymentStatus,
      };
      updatedEmployees = [newEmp, ...activeProject.employees];
      showToast(`✅ Added employee ${name}`);
    }

    const updatedProj: ProjectRecord = {
      ...activeProject,
      employees: updatedEmployees,
    };

    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProj : p)));
    setIsModalOpen(false);
    await syncToFirestore(updatedProj);
  };

  // Update Payment Status and broadcast
  const handleUpdatePaymentStatus = async (newStatus: PaymentStatus, method: PaymentMethod) => {
    if (!paymentTarget) return;
    const { id, name } = paymentTarget;
    const nowTime = new Date().toLocaleDateString();

    const updatedEmployees = activeProject.employees.map((e) =>
      e.id === id
        ? {
            ...e,
            paymentStatus: newStatus,
            paymentMethod: method,
            paidAt: newStatus === 'paid' ? nowTime : undefined,
            paymentRef: newStatus === 'paid' ? `MOMO-${Date.now().toString().slice(-6)}` : undefined,
          }
        : e
    );

    const updatedProj: ProjectRecord = {
      ...activeProject,
      employees: updatedEmployees,
    };

    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProj : p)));
    setPaymentTarget(null);

    if (newStatus === 'paid') {
      showToast(`🎉 Marked ${name} as PAID via ${method.toUpperCase()}!`);
    } else {
      showToast(`Marked ${name} as PENDING.`);
    }

    await syncToFirestore(updatedProj);
  };

  // Quick 1-Click Status Toggle in Table and broadcast
  const handleQuickTogglePaid = async (id: string, name: string, current: PaymentStatus) => {
    const nextStatus: PaymentStatus = current === 'paid' ? 'pending' : 'paid';
    const nowTime = new Date().toLocaleDateString();

    const updatedEmployees = activeProject.employees.map((e) =>
      e.id === id
        ? {
            ...e,
            paymentStatus: nextStatus,
            paidAt: nextStatus === 'paid' ? nowTime : undefined,
          }
        : e
    );

    const updatedProj: ProjectRecord = {
      ...activeProject,
      employees: updatedEmployees,
    };

    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProj : p)));

    if (nextStatus === 'paid') {
      showToast(`✓ Marked ${name} as PAID!`);
    } else {
      showToast(`Marked ${name} as Pending.`);
    }

    await syncToFirestore(updatedProj);
  };

  // Delete Worker and broadcast
  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;

    const updatedEmployees = activeProject.employees.filter((e) => e.id !== id);
    const updatedProj: ProjectRecord = {
      ...activeProject,
      employees: updatedEmployees,
    };

    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProj : p)));
    setDeleteTarget(null);
    setIsModalOpen(false);
    showToast(`🗑️ Deleted "${name}" successfully`);

    await syncToFirestore(updatedProj);
  };

  // Copy helper
  const copyText = (txt: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt);
    }
    showToast(`Copied ${label}: ${txt}`);
  };

  // Public Share URL (Accessible to other phones, unlike ais-dev which is restricted to your account)
  const PUBLIC_SHARE_URL = 'https://ais-pre-43l745a7elf2bztm6xtt53-496920733130.europe-west2.run.app';
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Share Live Link to another phone
  const handleShareLiveLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AbakoziPay – Rwanda Labor Wage & Mobile Money Manager',
        text: `Open live site roster on AbakoziPay for ${activeProject.name} (Updates sync automatically via MoMo & Airtel E-Kash):`,
        url: PUBLIC_SHARE_URL,
      }).catch(() => {
        setIsShareModalOpen(true);
      });
    } else {
      setIsShareModalOpen(true);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = `ABAKOZI & LABOR PAYMENT - ${activeProject.name}\nGenerated,${new Date().toLocaleString()}\n\n`;
    csv += `#,Name,Phone,Payment Option,Trade,Amount (Frw),Status,Paid Date\n`;
    activeProject.employees.forEach((emp, i) => {
      const carrier = getCarrierInfo(emp.phone).name;
      csv += `${i + 1},"${emp.name}","${emp.phone}","${carrier}","${emp.trade || ''}",${emp.amount},"${emp.paymentStatus || 'pending'}","${emp.paidAt || ''}"\n`;
    });
    csv += `\nTotal Wages (Frw),${totalWages}\n`;
    csv += `Total Paid (Frw),${totalPaid}\n`;
    csv += `Total Pending (Frw),${totalPending}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `abakozi-wages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('📊 CSV spreadsheet downloaded');
  };

  // Backup JSON
  const handleExportJSON = () => {
    const data = {
      app: 'Abakozi & Labor Payment Manager with Cloud Sync',
      exportedAt: new Date().toISOString(),
      activeProjectId,
      projects,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `abakozi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('💾 Offline backup file downloaded');
  };

  // Restore JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.projects && Array.isArray(parsed.projects)) {
          setProjects(parsed.projects);
          if (parsed.activeProjectId) setActiveProjectId(parsed.activeProjectId);
          showToast('📥 Backup restored successfully');
          const target = parsed.projects.find((p: any) => p.id === (parsed.activeProjectId || activeProjectId));
          if (target) await syncToFirestore(target);
        } else {
          showToast('⚠️ Invalid backup file format');
        }
      } catch {
        showToast('⚠️ Corrupted backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 selection:bg-blue-600 selection:text-white">
      
      {/* =========================================================================
          1. HEADER (WITH REAL-TIME CLOUD SYNC BADGE)
          ========================================================================= */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-blue-500/30 border-t border-blue-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                  <span className="text-blue-700">AbakoziPay</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-slate-700 text-xs sm:text-sm font-semibold">Labor & Wages</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  <span>Live Sync</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Disburse labor wages via MTN MoMo & Airtel E-Kash · Real-time multi-device sync
              </p>
            </div>
          </div>

          {/* Project Selector, Live Share & PWA Install */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLiveLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-xs font-bold text-blue-700 transition-all shadow-xs cursor-pointer"
              title="Share live link to other phones (updates sync automatically)"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Share Live Link</span>
            </button>

            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 transition-all shadow-xs"
              title="Switch or add project site"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">{activeProject.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isInstallable && !isInstalled && (
              <button
                onClick={install}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          LIVE SYNC STATUS BAR
          ========================================================================= */}
      <div className="bg-emerald-50/80 border-b border-emerald-200 py-1.5 px-4 text-center text-xs text-emerald-900 font-semibold flex items-center justify-center gap-2">
        <Cloud className="w-3.5 h-3.5 text-emerald-600" />
        <span><b>Multi-Device Live Sync:</b> Updates made on any phone appear on yours instantly.</span>
      </div>

      {/* =========================================================================
          2. THE 3 CLEAN 3D METRIC CARDS ON WHITE BACKGROUND
          ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Total Wages */}
          <div className="card-3d bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border-t border-blue-300">
              <Users className="w-6 h-6" />
            </div>

            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Total Labor Wages (Abakozi)
            </div>
            
            <div className="font-mono font-black text-2xl sm:text-3xl text-slate-900 tracking-tight mt-1">
              {money(totalWages)}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2.5">
              <span><b>{activeProject.employees.length}</b> Registered Workers</span>
              <span className="font-mono text-slate-500">
                Avg: {money(Math.round(totalWages / (activeProject.employees.length || 1)))}
              </span>
            </div>
          </div>

          {/* Card 2: Disbursed / Paid */}
          <div className="card-3d bg-white border border-emerald-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 border-t border-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              Total Paid Out (Disbursed)
            </div>
            
            <div className="font-mono font-black text-2xl sm:text-3xl text-emerald-600 tracking-tight mt-1">
              {money(totalPaid)}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2.5">
              <span><b>{countPaid}</b> Workers Disbursed</span>
              <span className="text-emerald-700 font-bold">
                {Math.round((totalPaid / (totalWages || 1)) * 100)}% Completed
              </span>
            </div>
          </div>

          {/* Card 3: Pending to Pay */}
          <div className="card-3d bg-white border border-amber-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 border-t border-amber-300">
              <Clock className="w-6 h-6" />
            </div>

            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              Remaining to Pay (Unpaid)
            </div>
            
            <div className="font-mono font-black text-2xl sm:text-3xl text-amber-600 tracking-tight mt-1">
              {money(totalPending)}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2.5">
              <span><b>{countPending}</b> Workers Waiting</span>
              <span className="text-amber-700 font-bold">Ready for MoMo Pay</span>
            </div>
          </div>

        </div>

        {/* =========================================================================
            3. ACTION TOOLBAR ON WHITE BACKGROUND
            ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm no-print">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Primary Action Button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleOpenAddEmployee}
                className="btn-3d-blue text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>

            {/* Data & Backup Tools */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Export CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Download JSON backup"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Restore JSON backup"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Restore</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJSON}
              />
            </div>
          </div>

          {/* Search, Filter & Sorter */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            
            {/* Filter by Payment Status (All / Unpaid / Paid) */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setPaymentFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  paymentFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Workers ({activeProject.employees.length})
              </button>
              <button
                onClick={() => setPaymentFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  paymentFilter === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs' : 'text-slate-600 hover:text-amber-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Pending ({countPending})</span>
              </button>
              <button
                onClick={() => setPaymentFilter('paid')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  paymentFilter === 'paid' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs' : 'text-slate-600 hover:text-emerald-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Paid ({countPaid})</span>
              </button>
            </div>

            {/* Search Input & Sorter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, phone, trade..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. EMPLOYEES (ABAKOZI) TABLE — CLEAN, CRISP WHITE DESIGN
            ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Table Header Strip */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Abakozi (Employees) Roster</span>
                <span className="text-xs font-mono font-normal text-slate-500">
                  ({filteredEmployees.length} workers)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tap any phone number or the <strong>Payment Option</strong> button to pay via MTN MoMo, Airtel Money, or Cash.
              </p>
            </div>

            <div className="font-mono text-sm font-bold text-slate-900">
              Total Wages: <span className="text-emerald-700">{money(totalWages)}</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-4">Worker & Phone Number</th>
                  <th className="py-3 px-4">Payment Option</th>
                  <th className="py-3 px-4">Trade / Specialty</th>
                  <th className="py-3 px-4 text-right">Amount Payable (Frw)</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-center no-print w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700">No employees match your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, idx) => {
                    const carrier = getCarrierInfo(emp.phone);
                    const isPaid = emp.paymentStatus === 'paid';
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* Number */}
                        <td className="py-3.5 px-3 font-mono text-center text-slate-400 font-medium">
                          {idx + 1}
                        </td>

                        {/* Name & Phone */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span className="font-semibold">{emp.phone || '—'}</span>
                            {emp.phone && (
                              <button
                                onClick={() => copyText(emp.phone, 'Phone')}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title="Copy phone"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* PAYMENT OPTIONS BADGE & DIRECT TRIGGER */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() =>
                              setPaymentTarget({
                                id: emp.id,
                                name: emp.name,
                                phone: emp.phone,
                                amount: emp.amount,
                                trade: emp.trade,
                                currentStatus: emp.paymentStatus || 'pending',
                                currentMethod: emp.paymentMethod || carrier.carrier,
                                paidAt: emp.paidAt,
                                paymentRef: emp.paymentRef,
                              })
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${carrier.color}`}
                            title={`Click to open payment options for ${emp.phone}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${carrier.carrier === 'momo' ? 'bg-amber-500' : 'bg-rose-600'}`} />
                            <span>{carrier.short}</span>
                            <Send className="w-3 h-3 ml-0.5 opacity-70" />
                          </button>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            USSD: {carrier.code}
                          </div>
                        </td>

                        {/* Trade / Specialty */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                            {emp.trade || 'General Labor'}
                          </span>
                        </td>

                        {/* Amount Payable */}
                        <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-slate-900 tabular-nums">
                          {money(emp.amount)}
                        </td>

                        {/* Payment Status Indicator (Toggleable) */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleQuickTogglePaid(emp.id, emp.name, emp.paymentStatus || 'pending')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                            }`}
                            title="Click to toggle Paid / Pending"
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>PAID</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>PENDING</span>
                              </>
                            )}
                          </button>
                          {emp.paidAt && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {emp.paidAt}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center no-print">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Open Payment Options */}
                            <button
                              onClick={() =>
                                setPaymentTarget({
                                  id: emp.id,
                                  name: emp.name,
                                  phone: emp.phone,
                                  amount: emp.amount,
                                  trade: emp.trade,
                                  currentStatus: emp.paymentStatus || 'pending',
                                  currentMethod: emp.paymentMethod || carrier.carrier,
                                  paidAt: emp.paidAt,
                                  paymentRef: emp.paymentRef,
                                })
                              }
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors"
                              title="Pay via MoMo / Airtel / Cash"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Voucher */}
                            <button
                              onClick={() => setVoucherEmp(emp)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                              title="Print Pay Voucher"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                            </button>

                            {/* Edit Worker */}
                            <button
                              onClick={() => handleOpenEditEmployee(emp)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                              title="Edit Worker"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Worker */}
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  id: emp.id,
                                  name: emp.name,
                                  amount: emp.amount,
                                  trade: emp.trade || 'Worker',
                                })
                              }
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-colors"
                              title="Delete Worker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 font-mono">
              Showing {filteredEmployees.length} of {activeProject.employees.length} workers · Paid: <b className="text-emerald-700">{money(totalPaid)}</b> · Unpaid: <b className="text-amber-800">{money(totalPending)}</b>
            </span>
            <div className="font-mono text-sm font-bold text-slate-900">
              Grand Total: <span className="text-emerald-700">{money(totalWages)}</span>
            </div>
          </div>
        </div>

      </main>

      {/* =========================================================================
          MODAL 0: 3D PAYMENT OPTIONS & DIRECT MOMO DIALER
          ========================================================================= */}
      {paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-amber-300 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md border-t border-amber-200 shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Payment Options for {paymentTarget.name}
                  </h3>
                  <p className="text-xs text-amber-800 font-medium">
                    Send wages via Mobile Money, Airtel Money, or Cash
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payee Details Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Worker Name</span>
                <span className="text-sm font-extrabold text-slate-900 block mt-0.5">{paymentTarget.name}</span>
                {paymentTarget.trade && (
                  <span className="text-[11px] text-slate-500">{paymentTarget.trade}</span>
                )}
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Registered Mobile Number</span>
                <span className="text-sm font-mono font-bold text-slate-900 block mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{paymentTarget.phone}</span>
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {getCarrierInfo(paymentTarget.phone).name}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-700 font-bold">Wages to Pay:</span>
                <span className="font-mono text-xl font-black text-emerald-700">
                  {money(paymentTarget.amount)}
                </span>
              </div>
            </div>

            {/* DIRECT PAYMENT METHODS */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Instant Payment Option:
              </div>

              {/* Option 1: MTN Mobile Money (MoMo) */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-bold text-slate-900 text-xs">MTN Mobile Money (MoMo *182#)</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-900 font-bold">Recommended in Rwanda</span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tap the button on your mobile phone to launch the MoMo transfer with pre-filled number and amount:
                </p>

                {/* 3D MoMo Dial Button */}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${encodeURIComponent('*182*1*1*' + paymentTarget.phone.replace(/[^0-9]/g, '') + '*' + paymentTarget.amount + '#')}`}
                    className="btn-3d-momo flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md text-slate-950"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dial MoMo (*182*1*1*{paymentTarget.phone.replace(/[^0-9]/g, '')}*{paymentTarget.amount}#)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        `*182*1*1*${paymentTarget.phone.replace(/[^0-9]/g, '')}*${paymentTarget.amount}#`,
                        'MTN MoMo Code'
                      )
                    }
                    className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Airtel Money (E-Kash) */}
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600" />
                    <span className="font-bold text-slate-900 text-xs">Airtel Money (E-Kash *182# / *500#)</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-800 font-bold">E-Kash Rwanda</span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tap to launch direct Airtel E-Kash transfer with recipient number and wage amount:
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${encodeURIComponent('*182*1*1*' + paymentTarget.phone.replace(/[^0-9]/g, '') + '*' + paymentTarget.amount + '#')}`}
                    className="btn-3d-airtel flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md text-white"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dial Airtel E-Kash (*182*1*1*{paymentTarget.phone.replace(/[^0-9]/g, '')}*{paymentTarget.amount}#)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        `*182*1*1*${paymentTarget.phone.replace(/[^0-9]/g, '')}*${paymentTarget.amount}#`,
                        'Airtel E-Kash Code'
                      )
                    }
                    className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Option 3: Cash & Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdatePaymentStatus('paid', 'cash')}
                  className="p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-300 text-left transition-all"
                >
                  <div className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    <span>Pay in Cash on Site</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Mark as paid in cash with paper voucher signature.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdatePaymentStatus('paid', 'bank')}
                  className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-300 text-left transition-all"
                >
                  <div className="font-bold text-xs text-blue-800 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Bank Transfer (BK / Equity)</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Wire transfer via internet banking or bank app.
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Status Mark Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-600">
                Current Status:{' '}
                <strong className={paymentTarget.currentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-800'}>
                  {paymentTarget.currentStatus === 'paid' ? '✓ ALREADY PAID' : '⏳ PENDING (UNPAID)'}
                </strong>
              </span>

              <div className="flex items-center gap-2">
                {paymentTarget.currentStatus === 'paid' ? (
                  <button
                    type="button"
                    onClick={() => handleUpdatePaymentStatus('pending', paymentTarget.currentMethod || 'momo')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                  >
                    Revert to Pending
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpdatePaymentStatus('paid', getCarrierInfo(paymentTarget.phone).carrier)}
                    className="btn-3d-emerald px-4 py-2 rounded-xl text-white font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm as Paid</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: 3D DELETE CONFIRMATION (100% RELIABLE)
          ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-rose-300 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-300">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Remove Employee
                </h3>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">Permanent removal confirmation</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs text-slate-500 font-medium">Worker to be deleted:</div>
              <div className="text-base font-bold text-slate-900">{deleteTarget.name}</div>
              {deleteTarget.trade && (
                <div className="text-xs text-slate-500">{deleteTarget.trade}</div>
              )}
              {deleteTarget.amount ? (
                <div className="font-mono text-sm font-bold text-rose-600 pt-1">
                  Wages: {money(deleteTarget.amount)}
                </div>
              ) : null}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This worker will be removed from your project roster and totals will recalculate immediately across all connected devices.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="btn-3d-rose px-5 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD / EDIT EMPLOYEE
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>{editItem ? 'Edit Employee Details' : 'Add New Employee'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-semibold">
              
              {/* Name */}
              <div>
                <label className="block text-slate-600 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ntezimana, Jean Pierre"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              {/* Phone & Trade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">
                    Phone Number (MoMo / Airtel) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0783962754"
                    value={formPhone}
                    onChange={(e) => {
                      setFormPhone(e.target.value);
                      setFormPaymentMethod(getCarrierInfo(e.target.value).carrier);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  {formPhone && (
                    <span className="text-[10px] text-amber-800 mt-1 block">
                      Detected: {getCarrierInfo(formPhone).name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Trade / Duty</label>
                  <input
                    type="text"
                    placeholder="e.g. Mason (Umwubatsi), Helper"
                    value={formTrade}
                    onChange={(e) => setFormTrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              {/* Total Amount Payable */}
              <div>
                <label className="block text-slate-600 mb-1">
                  Amount Payable (Frw) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  placeholder="e.g. 28000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base font-mono font-black text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Payment Option & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="momo">MTN Mobile Money (*182#)</option>
                    <option value="airtel">Airtel Money (E-Kash *182# / *500#)</option>
                    <option value="cash">Cash on Site</option>
                    <option value="bank">Bank Wire Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Payment Status</label>
                  <select
                    value={formPaymentStatus}
                    onChange={(e) => setFormPaymentStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="pending">⏳ Pending (Unpaid)</option>
                    <option value="paid">✓ Paid (Completed)</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2.5">
                {editItem ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setDeleteTarget({
                        id: editItem.id,
                        name: editItem.name,
                        amount: editItem.amount,
                        trade: editItem.trade,
                      });
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Worker</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-3d-blue px-5 py-2.5 rounded-xl font-extrabold text-xs text-white cursor-pointer shadow-md"
                  >
                    Save Worker
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: PRINTABLE PAY VOUCHER / SLIP
          ========================================================================= */}
      {voucherEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[95vh] overflow-y-auto print:shadow-none print:p-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
              <span className="font-bold text-sm text-slate-700">Official Labor Payment Voucher</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setVoucherEmp(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center pb-3 border-b border-slate-300">
                <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                  WAGE DISBURSAL VOUCHER
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Project: <strong>{activeProject.name}</strong> · Site: {activeProject.location || 'Rwanda'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Worker Name</span>
                  <span className="font-bold text-sm text-slate-900">{voucherEmp.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Mobile Phone</span>
                  <span className="font-mono font-bold text-slate-800">{voucherEmp.phone}</span>
                  <span className="text-[10px] text-slate-500 block">{getCarrierInfo(voucherEmp.phone).name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Trade / Duty</span>
                  <span className="font-medium text-slate-800">{voucherEmp.trade || 'General Labor'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Payment Option</span>
                  <span className="font-bold uppercase text-slate-800">{voucherEmp.paymentMethod || 'momo'}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-slate-950">
                  <span>Net Amount Paid:</span>
                  <span className="text-lg font-black font-mono text-emerald-700">
                    {money(voucherEmp.amount)}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-emerald-800 text-xs font-bold">
                ✓ VERIFIED & APPROVED FOR DISBURSAL
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-xs">
                <div className="border-t border-slate-400 pt-2 text-center text-slate-600">
                  Worker Signature / Thumbprint
                </div>
                <div className="border-t border-slate-400 pt-2 text-center text-slate-600">
                  Site Supervisor / Kapita
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: NEW PROJECT CREATION & MANAGEMENT
          ========================================================================= */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Site Project Management</span>
              </h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List existing projects */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Existing Sites ({projects.length})
              </span>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                      p.id === activeProjectId
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveProjectId(p.id);
                        setIsProjectModalOpen(false);
                        showToast(`Switched to "${p.name}".`);
                      }}
                      className="text-left flex-1"
                    >
                      <span className="font-bold block text-sm">{p.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {p.employees.length} employees · {p.location || 'Site'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Create new project form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = newProjectName.trim();
                if (!name) return;
                const newProj: ProjectRecord = {
                  id: `proj-${Date.now()}`,
                  name,
                  location: newProjectLocation.trim() || 'Rwanda',
                  employees: initDefaultEmployees().slice(0, 5),
                };
                setProjects((prev) => [...prev, newProj]);
                setActiveProjectId(newProj.id);
                syncToFirestore(newProj);
                setNewProjectName('');
                setNewProjectLocation('');
                setIsProjectModalOpen(false);
                showToast(`Created project "${name}".`);
              }}
              className="space-y-3 pt-2 border-t border-slate-200 text-xs font-semibold"
            >
              <span className="text-xs text-slate-700 font-bold block">Create New Project</span>
              <div>
                <label className="block text-slate-600 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bugesera Housing Phase 2"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Site Location (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Bugesera District"
                  value={newProjectLocation}
                  onChange={(e) => setNewProjectLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn-3d-blue px-4 py-2 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: SHARE LIVE APP WITH TEAM / OTHER PHONES
          ========================================================================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-blue-300 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Share AbakoziPay with Team
                  </h3>
                  <p className="text-[11px] text-slate-500">Live multi-device roster sync</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anyone with this link can open the app on their phone, add workers, and record wages. All updates sync to your phone in real time!
            </p>

            {/* URL Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Public Live Link:
              </span>
              <div className="font-mono text-xs text-blue-700 bg-white p-2.5 rounded-lg border border-slate-200 break-all select-all font-semibold">
                {PUBLIC_SHARE_URL}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* WhatsApp Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Open AbakoziPay live site roster for ' + activeProject.name + ' (updates sync live): ' + PUBLIC_SHARE_URL)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>

              {/* Copy Link Button */}
              <button
                type="button"
                onClick={() => {
                  copyText(PUBLIC_SHARE_URL, 'Public Live Link');
                  setIsShareModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Link to Clipboard</span>
              </button>
            </div>

            {/* Permissions Note */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong className="block font-bold mb-0.5">⚠️ If another phone sees "You do not have access":</strong>
              Make sure to send this <strong>Public link</strong> (ending in <code className="font-mono font-bold">ais-pre-...</code>), NOT the private developer link (<code className="font-mono font-bold">ais-dev-...</code>).
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
