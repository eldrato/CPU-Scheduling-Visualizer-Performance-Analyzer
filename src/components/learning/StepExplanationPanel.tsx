import React, { useState } from 'react';
import { StepLog } from '../../algorithms/types';
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Props {
  stepLogs: StepLog[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export const StepExplanationPanel: React.FC<Props> = ({
  stepLogs,
  currentTime,
  onSeek,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  if (stepLogs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
        No step events recorded yet. Run or step through the simulation.
      </div>
    );
  }

  // Find nearest event at or immediately before currentTime
  const currentEvent = [...stepLogs].reverse().find((l) => l.time <= currentTime) || stepLogs[0];

  const filteredLogs = stepLogs.filter((l) => {
    if (filter === 'ALL') return true;
    return l.event === filter;
  });

  const getEventBadge = (event: StepLog['event']) => {
    switch (event) {
      case 'ARRIVAL':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'SCHEDULE':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'PREEMPT':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'COMPLETE':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'AGING':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'IDLE':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            Step-by-Step Scheduling Narrator
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[11px]">
          {['ALL', 'SCHEDULE', 'PREEMPT', 'ARRIVAL', 'AGING'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Active Clock Narration Highlight Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-850 dark:to-blue-950/30 border-b border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Active Narration at t = {currentTime}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {currentEvent.event}
            </span>
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-100 font-medium mt-1 leading-relaxed">
            {currentEvent.description}
          </p>
        </div>
      </div>

      {/* Detailed Chronological Event Logs List */}
      <div className="flex-1 overflow-y-auto max-h-[360px] p-2 space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/40">
        {filteredLogs.map((log, idx) => {
          const isCurrent = log.time === currentTime;
          return (
            <div
              key={`${log.time}-${log.event}-${idx}`}
              onClick={() => onSeek(log.time)}
              className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                isCurrent
                  ? 'ring-1 ring-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                  : ''
              }`}
            >
              <span className="px-2 py-0.5 font-mono text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                t={log.time}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-md border uppercase ${getEventBadge(
                      log.event
                    )}`}
                  >
                    {log.event}
                  </span>
                  {log.runningProcess && (
                    <span className="text-[10px] font-mono text-slate-400">
                      CPU: <strong>{log.runningProcess}</strong>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  {log.description}
                </p>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
