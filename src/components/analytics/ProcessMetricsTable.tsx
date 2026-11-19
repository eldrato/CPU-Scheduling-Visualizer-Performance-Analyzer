import React, { useState } from 'react';
import { ProcessMetric } from '../../types/process';
import { AlertCircle, Sliders, ArrowUpDown } from 'lucide-react';

interface Props {
  metrics: Record<string, ProcessMetric>;
  showPriority: boolean;
}

export const ProcessMetricsTable: React.FC<Props> = ({ metrics, showPriority }) => {
  const [starvationThreshold, setStarvationThreshold] = useState<number>(10);
  const [starvationMode, setStarvationMode] = useState<'fixed' | 'multiplier'>('multiplier');
  const [sortField, setSortField] = useState<keyof ProcessMetric>('pid');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const list = Object.values(metrics);

  const isStarved = (m: ProcessMetric): boolean => {
    if (starvationMode === 'multiplier') {
      return m.waitingTime > m.burstTime * 2.5 && m.waitingTime > 4;
    }
    return m.waitingTime >= starvationThreshold;
  };

  const sortedList = [...list].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc
        ? valA.localeCompare(valB, undefined, { numeric: true })
        : valB.localeCompare(valA, undefined, { numeric: true });
    }

    valA = (valA as number) ?? 0;
    valB = (valB as number) ?? 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field: keyof ProcessMetric) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const starvedCount = list.filter(isStarved).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header and Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            Per-Process Execution Metrics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            TAT = CT - AT &bull; WT = TAT - BT &bull; RT = Start - AT
          </p>
        </div>

        {/* Starvation Config */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-600 dark:text-slate-300">Starvation Rule:</span>
            <select
              value={starvationMode}
              onChange={(e) => setStarvationMode(e.target.value as any)}
              className="bg-transparent font-medium text-blue-600 dark:text-blue-400 outline-none cursor-pointer"
            >
              <option value="multiplier">WT &gt; 2.5 &times; Burst</option>
              <option value="fixed">WT &ge; Fixed Threshold</option>
            </select>

            {starvationMode === 'fixed' && (
              <input
                type="number"
                min="1"
                value={starvationThreshold}
                onChange={(e) => setStarvationThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 px-1.5 py-0.5 font-mono text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-800 dark:text-slate-200"
              />
            )}
          </div>

          {starvedCount > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              {starvedCount} Process{starvedCount > 1 ? 'es' : ''} Starved
            </span>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850 text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort('pid')}>
                <div className="flex items-center gap-1">
                  PID <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort('arrivalTime')}>
                <div className="flex items-center gap-1">
                  Arrival (AT) <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort('burstTime')}>
                <div className="flex items-center gap-1">
                  Burst (BT) <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              {showPriority && (
                <th className="py-2.5 px-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1">
                    Priority <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
              )}
              <th className="py-2.5 px-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort('startTime')}>
                <div className="flex items-center gap-1">
                  Start Time <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort('completionTime')}>
                <div className="flex items-center gap-1">
                  Completion (CT) <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort('turnaroundTime')}>
                <div className="flex items-center gap-1">
                  Turnaround (TAT) <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort('waitingTime')}>
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  Waiting (WT) <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-blue-600" onClick={() => handleSort('responseTime')}>
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                  Response (RT) <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedList.map((m) => {
              const starved = isStarved(m);
              return (
                <tr
                  key={m.pid}
                  className={`border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                    starved ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                    {m.pid}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{m.arrivalTime}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{m.burstTime}</td>
                  {showPriority && (
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{m.priority ?? 0}</td>
                  )}
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{m.startTime}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {m.completionTime}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">
                    {m.turnaroundTime}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                    {m.waitingTime}
                  </td>
                  <td className="py-2.5 px-3 text-purple-600 dark:text-purple-400 font-medium">
                    {m.responseTime}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {starved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" /> Starved
                      </span>
                    ) : (
                      <span className="text-[10px] font-sans text-emerald-600 dark:text-emerald-400 font-medium">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
