import React from 'react';
import { Project, CurrencyCode } from '../types';
import { CURRENCY_SYMBOLS } from '../utils/calculations';
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Download, 
  RefreshCw,
  Clock,
  Receipt
} from 'lucide-react';

interface TopBarProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
  onQuickLogHours: () => void;
  onQuickAddExpense: () => void;
  currency: CurrencyCode;
  onChangeCurrency: (currency: CurrencyCode) => void;
  onResetDemoData: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onOpenNewProject,
  onQuickLogHours,
  onQuickAddExpense,
  currency,
  onChangeCurrency,
  onResetDemoData,
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 no-print">
      {/* Zone 1: Single text element Brand Wordmark */}
      <div className="flex items-center gap-6">
        <a href="#overview" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shadow-sm">
            BP
          </span>
          <span>BuildPay</span>
        </a>

        {/* Project Selector Breadcrumb */}
        <div className="relative">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-sm font-medium text-slate-200 transition-colors"
            title="Switch project"
          >
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="max-w-[180px] sm:max-w-[240px] truncate text-slate-100 font-medium">
              {activeProject.name}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden md:inline">
              ({activeProject.code})
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </button>

          {projectDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setProjectDropdownOpen(false)} 
              />
              <div className="absolute left-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-800">
                  Select Project ({projects.length})
                </div>
                <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                  {projects.map((proj) => {
                    const isSelected = proj.id === activeProject.id;
                    return (
                      <button
                        key={proj.id}
                        onClick={() => {
                          onSelectProject(proj.id);
                          setProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-start justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 text-amber-300 font-medium border border-amber-500/30'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate font-medium">{proj.name}</p>
                          <p className="text-xs text-slate-400 truncate">{proj.client} · {proj.location}</p>
                        </div>
                        <span className="text-xs font-mono text-slate-400 shrink-0 mt-0.5">
                          {proj.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setProjectDropdownOpen(false);
                      onOpenNewProject();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create New Project
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Zone 2: Navigation Links / Status context */}
      <div className="hidden lg:flex items-center gap-6 text-sm text-slate-300 font-medium">
        <span className="text-xs text-slate-400 font-mono">
          Budget: <span className="text-slate-200 font-semibold">{CURRENCY_SYMBOLS[currency]}{activeProject.budget.toLocaleString()}</span>
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-xs text-slate-400">
          Client: <span className="text-slate-200 font-medium">{activeProject.client}</span>
        </span>
        <span className="text-slate-600">·</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Currency:</span>
          <select
            value={currency}
            onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
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

      {/* Zone 3: Primary Action buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onResetDemoData}
          title="Reset back to standard sample data"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={onQuickLogHours}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-500/20 active:scale-95"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Log Hours</span>
        </button>

        <button
          onClick={onQuickAddExpense}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap active:scale-95"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Expense</span>
        </button>
      </div>
    </header>
  );
};
