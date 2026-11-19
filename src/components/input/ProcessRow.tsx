import React from 'react';
import { Process } from '../../types/process';
import { Trash2 } from 'lucide-react';

interface Props {
  process: Process;
  errors?: Record<string, string>;
  isOnlyProcess: boolean;
  showPriority: boolean;
  showQueue: boolean;
  onChange: (updated: Process) => void;
  onDelete: () => void;
}

export const ProcessRow: React.FC<Props> = ({
  process,
  errors = {},
  isOnlyProcess,
  showPriority,
  showQueue,
  onChange,
  onDelete,
}) => {
  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60 group">
      {/* Color Badge + PID */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0 ring-2 ring-white dark:ring-slate-900"
            style={{ backgroundColor: process.color || '#3b82f6' }}
            title={`Color for ${process.pid}`}
          />
          <div className="w-full">
            <input
              type="text"
              value={process.pid}
              onChange={(e) => onChange({ ...process, pid: e.target.value })}
              className={`w-20 px-2 py-1 text-sm font-mono font-medium rounded-lg border outline-none transition-all ${
                errors.pid
                  ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 focus:ring-1 focus:ring-red-400'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500'
              }`}
              placeholder="e.g. P1"
            />
            {errors.pid && (
              <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{errors.pid}</p>
            )}
          </div>
        </div>
      </td>

      {/* Arrival Time */}
      <td className="py-2.5 px-3">
        <input
          type="number"
          min="0"
          value={process.arrivalTime}
          onChange={(e) =>
            onChange({ ...process, arrivalTime: parseInt(e.target.value) || 0 })
          }
          className={`w-20 px-2 py-1 text-sm font-mono rounded-lg border outline-none transition-all ${
            errors.arrivalTime
              ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 focus:ring-1 focus:ring-red-400'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500'
          }`}
        />
        {errors.arrivalTime && (
          <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{errors.arrivalTime}</p>
        )}
      </td>

      {/* Burst Time */}
      <td className="py-2.5 px-3">
        <input
          type="number"
          min="1"
          value={process.burstTime}
          onChange={(e) =>
            onChange({ ...process, burstTime: Math.max(1, parseInt(e.target.value) || 1) })
          }
          className={`w-20 px-2 py-1 text-sm font-mono rounded-lg border outline-none transition-all ${
            errors.burstTime
              ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 focus:ring-1 focus:ring-red-400'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500'
          }`}
        />
        {errors.burstTime && (
          <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{errors.burstTime}</p>
        )}
      </td>

      {/* Priority (Optional) */}
      {showPriority && (
        <td className="py-2.5 px-3">
          <input
            type="number"
            value={process.priority ?? 0}
            onChange={(e) =>
              onChange({ ...process, priority: parseInt(e.target.value) || 0 })
            }
            className={`w-20 px-2 py-1 text-sm font-mono rounded-lg border outline-none transition-all ${
              errors.priority
                ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 focus:ring-1 focus:ring-red-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500'
            }`}
          />
          {errors.priority && (
            <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{errors.priority}</p>
          )}
        </td>
      )}

      {/* Queue Level (MLFQ) */}
      {showQueue && (
        <td className="py-2.5 px-3">
          <select
            value={process.queueLevel ?? 0}
            onChange={(e) =>
              onChange({ ...process, queueLevel: parseInt(e.target.value) || 0 })
            }
            className="w-20 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={0}>Q0 (High)</option>
            <option value={1}>Q1 (Med)</option>
            <option value={2}>Q2 (Low)</option>
          </select>
        </td>
      )}

      {/* Actions */}
      <td className="py-2.5 px-3 text-right">
        <button
          onClick={onDelete}
          disabled={isOnlyProcess}
          title={isOnlyProcess ? 'At least one process is required' : `Delete ${process.pid}`}
          className={`p-1.5 rounded-lg transition-colors ${
            isOnlyProcess
              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
              : 'text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};
