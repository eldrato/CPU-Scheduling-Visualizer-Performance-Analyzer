import React, { useRef, useState } from 'react';
import { Process } from '../../types/process';
import { Scenario } from '../../types/scenario';
import { ProcessRow } from './ProcessRow';
import { ScenarioPresets } from './ScenarioPresets';
import { RandomGeneratorModal } from './RandomGeneratorModal';
import { getProcessColor } from '../../utils/colorGenerator';
import { validateProcessList } from '../../utils/validators';
import {
  exportProcessesToCSV,
  parseProcessesFromCSV,
  downloadCSV,
} from '../../utils/csvHelper';
import {
  Plus,
  Sparkles,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface Props {
  processes: Process[];
  onChangeProcesses: (updated: Process[]) => void;
  selectedAlgorithm: string;
}

export const ProcessTable: React.FC<Props> = ({
  processes,
  onChangeProcesses,
  selectedAlgorithm,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('silberschatz-convoy');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showPriority = selectedAlgorithm.includes('priority') || selectedAlgorithm === 'compare';
  const showQueue = selectedAlgorithm === 'mlfq' || selectedAlgorithm === 'compare';

  const { isValid, errorsByPid, generalErrors } = validateProcessList(processes);

  // Handle row updates
  const handleUpdateProcess = (index: number, updated: Process) => {
    const copy = [...processes];
    copy[index] = updated;
    onChangeProcesses(copy);
  };

  // Add a new blank process
  const handleAddProcess = () => {
    const nextIndex = processes.length + 1;
    let newPid = `P${nextIndex}`;
    // ensure unique PID
    while (processes.some((p) => p.pid === newPid)) {
      newPid = `P${parseInt(newPid.replace('P', ''), 10) + 1}`;
    }

    const lastArrival = processes.length > 0 ? processes[processes.length - 1].arrivalTime : 0;

    const newProcess: Process = {
      pid: newPid,
      arrivalTime: lastArrival,
      burstTime: 4,
      priority: 1,
      queueLevel: 0,
      color: getProcessColor(processes.length),
    };

    onChangeProcesses([...processes, newProcess]);
  };

  // Delete a process
  const handleDeleteProcess = (index: number) => {
    if (processes.length <= 1) return;
    const copy = processes.filter((_, i) => i !== index);
    onChangeProcesses(copy);
  };

  // Load a preset
  const handleSelectPreset = (scenario: Scenario) => {
    setSelectedScenarioId(scenario.id);
    onChangeProcesses(scenario.processes);
  };

  // Reset to default
  const handleResetProcesses = () => {
    const defaultScenario = {
      pid: 'P1',
      arrivalTime: 0,
      burstTime: 5,
      priority: 1,
      queueLevel: 0,
      color: getProcessColor(0),
    };
    onChangeProcesses([defaultScenario]);
    setSelectedScenarioId('');
  };

  // CSV Import handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = parseProcessesFromCSV(text);
      if (res.success && res.processes.length > 0) {
        onChangeProcesses(res.processes);
        setSelectedScenarioId('');
      } else {
        alert(res.error || 'Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // CSV Export handler
  const handleExportCSV = () => {
    const csv = exportProcessesToCSV(processes);
    downloadCSV('cpu_processes.csv', csv);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header section with Presets */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
        <ScenarioPresets
          selectedScenarioId={selectedScenarioId}
          onSelectScenario={handleSelectPreset}
        />

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddProcess}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Process</span>
            </button>
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-95 rounded-xl shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Random</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* CSV Import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import Processes from CSV"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              title="Export Processes to CSV"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleResetProcesses}
              title="Reset Table"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Validation Alert Banner */}
      {!isValid && generalErrors.length > 0 && (
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            {generalErrors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        </div>
      )}

      {/* Process Table Body */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[460px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs">
              <th className="py-2.5 px-3">Process ID</th>
              <th className="py-2.5 px-3">Arrival (AT)</th>
              <th className="py-2.5 px-3">Burst (BT)</th>
              {showPriority && <th className="py-2.5 px-3">Priority</th>}
              {showQueue && <th className="py-2.5 px-3">Queue</th>}
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, index) => (
              <ProcessRow
                key={p.pid || index}
                process={p}
                errors={errorsByPid[p.pid]}
                isOnlyProcess={processes.length === 1}
                showPriority={showPriority}
                showQueue={showQueue}
                onChange={(updated) => handleUpdateProcess(index, updated)}
                onDelete={() => handleDeleteProcess(index)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Total Processes: <strong className="text-slate-700 dark:text-slate-200">{processes.length}</strong></span>
        <span className="flex items-center gap-1.5 text-[11px]">
          <SlidersHorizontal className="w-3 h-3 text-slate-400" />
          Click any cell to edit inline
        </span>
      </div>

      {/* Random Generator Modal */}
      <RandomGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onGenerate={(newProcs) => {
          onChangeProcesses(newProcs);
          setSelectedScenarioId('');
        }}
      />
    </div>
  );
};
