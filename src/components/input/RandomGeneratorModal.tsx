import React, { useState } from 'react';
import { Process } from '../../types/process';
import { getProcessColor } from '../../utils/colorGenerator';
import { Sparkles, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (processes: Process[]) => void;
}

export const RandomGeneratorModal: React.FC<Props> = ({ isOpen, onClose, onGenerate }) => {
  const [count, setCount] = useState<number>(5);
  const [minArrival, setMinArrival] = useState<number>(0);
  const [maxArrival, setMaxArrival] = useState<number>(8);
  const [minBurst, setMinBurst] = useState<number>(1);
  const [maxBurst, setMaxBurst] = useState<number>(12);
  const [minPriority, setMinPriority] = useState<number>(1);
  const [maxPriority, setMaxPriority] = useState<number>(5);
  const [allowSimultaneousArrival, setAllowSimultaneousArrival] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const generated: Process[] = [];
    for (let i = 1; i <= count; i++) {
      const arrival = allowSimultaneousArrival && Math.random() < 0.3
        ? 0
        : Math.floor(Math.random() * (maxArrival - minArrival + 1)) + minArrival;
      const burst = Math.floor(Math.random() * (maxBurst - minBurst + 1)) + minBurst;
      const priority = Math.floor(Math.random() * (maxPriority - minPriority + 1)) + minPriority;

      generated.push({
        pid: `P${i}`,
        arrivalTime: arrival,
        burstTime: Math.max(1, burst),
        priority,
        queueLevel: 0,
        color: getProcessColor(i - 1),
      });
    }

    onGenerate(generated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-lg">
            <Sparkles className="w-5 h-5" />
            <span>Random Scenario Generator</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Number of Processes (N): {count}
            </label>
            <input
              type="range"
              min="2"
              max="12"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Min Arrival Time
              </label>
              <input
                type="number"
                min="0"
                value={minArrival}
                onChange={(e) => setMinArrival(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Max Arrival Time
              </label>
              <input
                type="number"
                min={minArrival}
                value={maxArrival}
                onChange={(e) => setMaxArrival(Math.max(minArrival, parseInt(e.target.value) || minArrival))}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Min Burst Time
              </label>
              <input
                type="number"
                min="1"
                value={minBurst}
                onChange={(e) => setMinBurst(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Max Burst Time
              </label>
              <input
                type="number"
                min={minBurst}
                value={maxBurst}
                onChange={(e) => setMaxBurst(Math.max(minBurst, parseInt(e.target.value) || minBurst))}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Min Priority
              </label>
              <input
                type="number"
                min="1"
                value={minPriority}
                onChange={(e) => setMinPriority(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Max Priority
              </label>
              <input
                type="number"
                min={minPriority}
                value={maxPriority}
                onChange={(e) => setMaxPriority(Math.max(minPriority, parseInt(e.target.value) || minPriority))}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={allowSimultaneousArrival}
              onChange={(e) => setAllowSimultaneousArrival(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Include simultaneous arrival at t=0
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate {count} Processes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
