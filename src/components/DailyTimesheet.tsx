import React, { useState } from 'react';
import { 
  Project, 
  Labour, 
  DailyAttendance, 
  CurrencyCode, 
  AttendanceStatus 
} from '../types';
import { 
  formatCurrency, 
  calculateAttendanceWage, 
  CURRENCY_SYMBOLS 
} from '../utils/calculations';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Clock, 
  Save, 
  Users, 
  Sparkles, 
  RotateCcw,
  Plus,
  Minus,
  MessageSquare
} from 'lucide-react';

interface DailyTimesheetProps {
  project: Project;
  labours: Labour[];
  attendances: DailyAttendance[];
  currency: CurrencyCode;
  onSaveAttendances: (attendances: DailyAttendance[]) => void;
  onSelectLabourForSlip: (labour: Labour) => void;
  onOpenAddLabour: () => void;
}

export const DailyTimesheet: React.FC<DailyTimesheetProps> = ({
  project,
  labours,
  attendances,
  currency,
  onSaveAttendances,
  onSelectLabourForSlip,
  onOpenAddLabour,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-29');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const projectLabours = labours.filter((l) => l.projectId === project.id);
  const activeLabours = projectLabours.filter((l) => l.status === 'active');

  // Find attendance records for the selected date
  const dateAttendances = attendances.filter(
    (a) => a.projectId === project.id && a.date === selectedDate
  );

  // Build a draft map labourId -> DailyAttendance
  const [draftMap, setDraftMap] = useState<Record<string, DailyAttendance>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync draftMap when selectedDate or attendances change
  React.useEffect(() => {
    const map: Record<string, DailyAttendance> = {};
    for (const lab of projectLabours) {
      const existing = dateAttendances.find((a) => a.labourId === lab.id);
      if (existing) {
        map[lab.id] = { ...existing };
      } else {
        // Default draft: present with standard 8 hrs
        const calc = calculateAttendanceWage(lab, 'present', lab.standardDailyHours || 8, 0);
        map[lab.id] = {
          id: `att-${lab.id}-${selectedDate}`,
          projectId: project.id,
          labourId: lab.id,
          date: selectedDate,
          status: 'present',
          regularHours: lab.standardDailyHours || 8,
          overtimeHours: 0,
          hourlyRateApplied: calc.hourlyRateApplied,
          overtimeRateApplied: calc.overtimeRateApplied,
          dailyWageCalculated: calc.totalWage,
          notes: '',
          verified: false,
        };
      }
    }
    setDraftMap(map);
    setHasUnsavedChanges(false);
  }, [selectedDate, project.id, attendances, labours]);

  // Navigate date
  const changeDateBy = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleUpdateRecord = (labourId: string, updates: Partial<DailyAttendance>) => {
    const current = draftMap[labourId];
    if (!current) return;

    const labour = projectLabours.find((l) => l.id === labourId);
    if (!labour) return;

    const newRecord = { ...current, ...updates };

    // Recalculate automatic wages
    const calc = calculateAttendanceWage(
      labour,
      newRecord.status,
      newRecord.regularHours,
      newRecord.overtimeHours
    );

    newRecord.hourlyRateApplied = calc.hourlyRateApplied;
    newRecord.overtimeRateApplied = calc.overtimeRateApplied;
    newRecord.dailyWageCalculated = calc.totalWage;

    setDraftMap((prev) => ({
      ...prev,
      [labourId]: newRecord,
    }));
    setHasUnsavedChanges(true);
  };

  const handleStatusChange = (labourId: string, status: AttendanceStatus) => {
    const labour = projectLabours.find((l) => l.id === labourId);
    if (!labour) return;

    let regularHours = 8;
    let overtimeHours = draftMap[labourId]?.overtimeHours || 0;

    if (status === 'half_day') regularHours = 4;
    if (status === 'absent' || status === 'leave') {
      regularHours = 0;
      overtimeHours = 0;
    }

    handleUpdateRecord(labourId, {
      status,
      regularHours,
      overtimeHours,
    });
  };

  // Quick Actions: Mark all active as Present (8h)
  const handleMarkAllPresent = () => {
    const updated = { ...draftMap };
    for (const lab of activeLabours) {
      const calc = calculateAttendanceWage(lab, 'present', lab.standardDailyHours || 8, 0);
      updated[lab.id] = {
        id: draftMap[lab.id]?.id || `att-${lab.id}-${selectedDate}`,
        projectId: project.id,
        labourId: lab.id,
        date: selectedDate,
        status: 'present',
        regularHours: lab.standardDailyHours || 8,
        overtimeHours: 0,
        hourlyRateApplied: calc.hourlyRateApplied,
        overtimeRateApplied: calc.overtimeRateApplied,
        dailyWageCalculated: calc.totalWage,
        notes: draftMap[lab.id]?.notes || '',
        verified: true,
      };
    }
    setDraftMap(updated);
    setHasUnsavedChanges(true);
  };

  // Quick Action: Reset day
  const handleResetDay = () => {
    const updated = { ...draftMap };
    for (const lab of activeLabours) {
      const calc = calculateAttendanceWage(lab, 'absent', 0, 0);
      updated[lab.id] = {
        id: draftMap[lab.id]?.id || `att-${lab.id}-${selectedDate}`,
        projectId: project.id,
        labourId: lab.id,
        date: selectedDate,
        status: 'absent',
        regularHours: 0,
        overtimeHours: 0,
        hourlyRateApplied: calc.hourlyRateApplied,
        overtimeRateApplied: calc.overtimeRateApplied,
        dailyWageCalculated: 0,
        notes: '',
        verified: false,
      };
    }
    setDraftMap(updated);
    setHasUnsavedChanges(true);
  };

  // Save Attendances
  const handleSave = () => {
    const newRecords = Object.values(draftMap);
    onSaveAttendances(newRecords);
    setHasUnsavedChanges(false);
    setSaveSuccessMsg(`Timesheet for ${selectedDate} saved successfully.`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Calculate day totals
  const records = Object.values(draftMap);
  const totalDayWorkersPresent = records.filter(
    (r) => r.status === 'present' || r.status === 'half_day'
  ).length;
  const totalDayRegHours = records.reduce((s, r) => s + (r.regularHours || 0), 0);
  const totalDayOtHours = records.reduce((s, r) => s + (r.overtimeHours || 0), 0);
  const totalDayWageCost = records.reduce((s, r) => s + (r.dailyWageCalculated || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Daily Attendance & Hours</span>
            <span aria-hidden="true">·</span>
            <span>Automatic Wage Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Daily Site Timesheet</span>
            {hasUnsavedChanges && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Unsaved changes
              </span>
            )}
          </h1>
        </div>

        {/* Date Selector and Navigation Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-1">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-semibold font-mono text-white focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => changeDateBy(1)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate('2026-09-29')}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            Today
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm ${
              hasUnsavedChanges
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-amber-500/30 scale-102'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Daily Metrics Bar & Quick Fill Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Workers On Site</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">
              {totalDayWorkersPresent} <span className="text-xs font-normal text-slate-400">/ {activeLabours.length}</span>
            </p>
          </div>
          <Users className="w-6 h-6 text-sky-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Regular Work Hours</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">
              {totalDayRegHours}h
            </p>
          </div>
          <Clock className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Overtime Hours</p>
            <p className="text-xl font-bold font-mono text-amber-400 mt-0.5 tabular-nums">
              +{totalDayOtHours}h
            </p>
          </div>
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Daily Labour Pay Cost</p>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
              {formatCurrency(totalDayWageCost, currency)}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {CURRENCY_SYMBOLS[currency]}
          </span>
        </div>
      </div>

      {/* Batch Operations Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <span className="text-slate-400">Fast Site Fill:</span>
          <button
            onClick={handleMarkAllPresent}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-medium"
          >
            Mark All Active as Present (8h)
          </button>
          <button
            onClick={handleResetDay}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors text-xs"
          >
            Reset All
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{projectLabours.length}</span> project labourers
        </div>
      </div>

      {/* Daily Interactive Timesheet Table */}
      {projectLabours.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <Users className="w-12 h-12 mx-auto text-slate-600" />
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-white">No Labour Assigned to This Project</h3>
            <p className="text-sm text-slate-400 mt-1">
              Add your first worker or contractor to start tracking daily hours and automated wages.
            </p>
          </div>
          <button
            onClick={onOpenAddLabour}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Labourer</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Labour Name & Role</th>
                  <th className="py-3 px-3">Base Rate</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3 text-center">Regular Hours</th>
                  <th className="py-3 px-3 text-center">Overtime Hours</th>
                  <th className="py-3 px-4 text-right">Calculated Pay</th>
                  <th className="py-3 px-4">Daily Site Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {projectLabours.map((labour) => {
                  const record = draftMap[labour.id];
                  if (!record) return null;

                  const isInactive = labour.status === 'inactive';

                  return (
                    <tr
                      key={labour.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isInactive ? 'opacity-50 bg-slate-950/30' : ''
                      }`}
                    >
                      {/* Worker info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {labour.avatarUrl ? (
                            <img
                              src={labour.avatarUrl}
                              alt={labour.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {labour.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-2">
                              <span>{labour.name}</span>
                              {isInactive && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  (inactive)
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              {labour.role} · {labour.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Wage Rate */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-200">
                          {formatCurrency(labour.defaultRate, currency)}
                          <span className="text-[10px] text-slate-400 ml-1">
                            /{labour.wageType === 'hourly' ? 'hr' : 'day'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          OT {labour.overtimeMultiplier}x
                        </div>
                      </td>

                      {/* Attendance Status Buttons */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800 w-max">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(labour.id, 'present')}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                              record.status === 'present'
                                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Full Day
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(labour.id, 'half_day')}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                              record.status === 'half_day'
                                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Half Day
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(labour.id, 'absent')}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                              record.status === 'absent'
                                ? 'bg-rose-500 text-white font-bold shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>

                      {/* Regular Hours Adjuster */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateRecord(labour.id, {
                                regularHours: Math.max(0, record.regularHours - 0.5),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            value={record.regularHours}
                            onChange={(e) =>
                              handleUpdateRecord(labour.id, {
                                regularHours: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-12 bg-slate-950 border border-slate-700 rounded py-1 text-center font-mono font-semibold text-slate-100 focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateRecord(labour.id, {
                                regularHours: Math.min(24, record.regularHours + 0.5),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Overtime Hours Adjuster */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateRecord(labour.id, {
                                overtimeHours: Math.max(0, record.overtimeHours - 0.5),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="16"
                            step="0.5"
                            value={record.overtimeHours}
                            onChange={(e) =>
                              handleUpdateRecord(labour.id, {
                                overtimeHours: parseFloat(e.target.value) || 0,
                              })
                            }
                            className={`w-12 bg-slate-950 border rounded py-1 text-center font-mono font-semibold focus:outline-none focus:border-amber-400 ${
                              record.overtimeHours > 0
                                ? 'border-amber-500/50 text-amber-300 bg-amber-500/5'
                                : 'border-slate-700 text-slate-400'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateRecord(labour.id, {
                                overtimeHours: Math.min(16, record.overtimeHours + 0.5),
                              })
                            }
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Live Calculated Pay */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                          {formatCurrency(record.dailyWageCalculated, currency)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {labour.wageType === 'hourly'
                            ? `${record.regularHours}h @ ${formatCurrency(record.hourlyRateApplied, currency)}`
                            : `Daily Rate`}
                          {record.overtimeHours > 0 && (
                            <span className="text-amber-400 ml-1">
                              (+{record.overtimeHours}h OT)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Notes / Remarks */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="e.g. Concrete slab pour, safety briefing..."
                          value={record.notes || ''}
                          onChange={(e) =>
                            handleUpdateRecord(labour.id, { notes: e.target.value })
                          }
                          className="w-full bg-slate-950/70 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </td>

                      {/* Row Action: Pay Slip */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectLabourForSlip(labour)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-medium border border-slate-700"
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Footer Summary */}
          <div className="bg-slate-950/80 px-4 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              Total Labour Daily Pay:{' '}
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                {formatCurrency(totalDayWageCost, currency)}
              </span>
              <span className="mx-2">·</span>
              Regular: <span className="font-mono text-slate-200">{totalDayRegHours} hrs</span>
              <span className="mx-2">·</span>
              Overtime: <span className="font-mono text-amber-400">+{totalDayOtHours} hrs</span>
            </div>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                hasUnsavedChanges
                  ? 'bg-amber-400 text-slate-950 font-bold hover:bg-amber-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{hasUnsavedChanges ? 'Save Changes Now' : 'All Changes Saved'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
