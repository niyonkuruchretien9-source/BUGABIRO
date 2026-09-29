import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  Receipt, 
  CreditCard, 
  BarChart3, 
  FolderKanban,
  FileSpreadsheet
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'timesheet' 
  | 'labour' 
  | 'expenses' 
  | 'payments' 
  | 'analytics';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeLabourCount: number;
  unpaidBalanceCount: number;
  onExportCSV: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeLabourCount,
  unpaidBalanceCount,
  onExportCSV,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'timesheet', label: 'Daily Timesheet', icon: Clock },
    { id: 'labour', label: 'Labour Roster', icon: Users, badge: activeLabourCount },
    { id: 'expenses', label: 'Project Expenses', icon: Receipt },
    { id: 'payments', label: 'Payments & Slips', icon: CreditCard, badge: unpaidBalanceCount > 0 ? `${unpaidBalanceCount} due` : undefined },
    { id: 'analytics', label: 'Financial Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 no-print">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-xs font-bold text-slate-400 tracking-wider">PROJECT WORKSPACE</p>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 font-semibold border-l-2 border-amber-500 pl-2.5'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                      isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Reports & Export Section */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <p className="px-3 text-xs font-bold text-slate-400 tracking-wider">REPORTS & EXPORT</p>
          <button
            onClick={onExportCSV}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Export Timesheet & Expenses</span>
          </button>
        </div>
      </div>

      {/* Bottom Summary Mini Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60">
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Automated Tracking</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Daily hours compute regular & overtime pay instantly upon entry.
          </p>
        </div>
      </div>
    </aside>
  );
};
